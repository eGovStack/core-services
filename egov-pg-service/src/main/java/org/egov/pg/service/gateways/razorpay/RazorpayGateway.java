package org.egov.pg.service.gateways.razorpay;

import static org.egov.pg.constants.TransactionAdditionalFields.BANK_ACCOUNT_NUMBER;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

import org.egov.pg.models.Transaction;
import org.egov.pg.service.Gateway;
import org.egov.tracer.model.ServiceCallException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.databind.ObjectMapper;

public class RazorpayGateway implements Gateway{

	private static final String GATEWAY_NAME = "RAZORPAY";
    private final String MERCHANT_ID;
    private final String SECURE_SECRET;
    private final String LOCALE;
    private final String CURRENCY;
    private RazorpayClient client;
    private final RestTemplate restTemplate;
    private ObjectMapper objectMapper;
    private final String MERCHANT_URL_PAY;
    private final String MERCHANT_URL_STATUS;
    
    private final boolean ACTIVE;
    
 

    @Autowired
    public RazorpayGateway(RestTemplate restTemplate, ObjectMapper objectMapper, Environment environment) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        
        ACTIVE = Boolean.valueOf(environment.getRequiredProperty("razorpay.active"));
        CURRENCY = environment.getRequiredProperty("razorpay.currency");
        LOCALE = environment.getRequiredProperty("razorpay.locale");
        MERCHANT_ID = environment.getRequiredProperty("razorpay.merchant.id");
        SECURE_SECRET = environment.getRequiredProperty("razorpay.merchant.secret.key");
        MERCHANT_URL_PAY = environment.getRequiredProperty("razorpay.url.debit");
        MERCHANT_URL_STATUS = environment.getRequiredProperty("razorpay.url.status");
        try {
            this.client = new RazorpayClient(this.MERCHANT_ID, this.SECURE_SECRET);
          } catch (RazorpayException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
          }
        
    }
    
	@Override
	public URI generateRedirectURI(Transaction transaction) {
		  Map<String, String> fields = new HashMap<>();
		  fields.put("vpc_Amount", String.valueOf(Utils.formatAmtAsPaise(transaction.getTxnAmount())));
	        fields.put("vpc_Merchant", MERCHANT_ID);
	        fields.put("vpc_Locale", LOCALE);
	        fields.put("vpc_Currency", CURRENCY);
	        fields.put("vpc_ReturnURL", transaction.getCallbackUrl());
	        fields.put("vpc_MerchTxnRef", transaction.getTxnId());
	        fields.put("vpc_OrderInfo", (String) transaction.getAdditionalFields().get(BANK_ACCOUNT_NUMBER));
	        

	        String secureHash = Utils.SHAhashAllFields(fields, SECURE_SECRET);

	        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
	        fields.forEach(params::add);

	        params.add("vpc_SecureHash", secureHash);
	        String ENCRYPTION_TYPE = "SHA256";
	        params.add("vpc_SecureHashType", ENCRYPTION_TYPE);

	        UriComponents uriComponents = UriComponentsBuilder.fromHttpUrl(MERCHANT_URL_PAY).queryParams
	                (params).build().encode();
	        return uriComponents.toUri();
	}

	@Override
	public Transaction fetchStatus(Transaction currentStatus, Map<String, String> params) {
        StringBuilder path = new StringBuilder();
        path.append(MERCHANT_URL_STATUS).append("/").append(currentStatus.getTxnId());

        try {
            HttpHeaders httpHeaders = new HttpHeaders();
            httpHeaders.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON.toString());

            HttpEntity<String> httpEntity = new HttpEntity<>("", httpHeaders);

            String uri = UriComponentsBuilder.newInstance().scheme("https").path(path.toString())
                    .build()
                    .toUriString();

            ResponseEntity<RazorpayClient> response = restTemplate.exchange(uri, HttpMethod.GET, httpEntity, RazorpayClient.class);


            return transformRawResponse(response.getBody(), currentStatus);
        } catch (RestClientException e){
            throw new ServiceCallException("Error occurred while fetching status from payment gateway");
        }
	}

	@Override
	public boolean isActive() {
		// TODO Auto-generated method stub
		return ACTIVE;
	}

	@Override
	public String gatewayName() {
		// TODO Auto-generated method stub
		return GATEWAY_NAME;
	}

	@Override
	public String transactionIdKeyInResponse() {
		// TODO Auto-generated method stub
		return "ORDERID";
	}
	
	 private Transaction transformRawResponse(RazorpayClient resp, Transaction currentStatus) {
	        Transaction.TxnStatusEnum status;

	        {
	            status = Transaction.TxnStatusEnum.SUCCESS;

	            return Transaction.builder()
	                    .txnId(currentStatus.getTxnId())
	                    .txnStatus(status)
	                    .responseJson(resp)
	                    .build();
	        }
	    }

}
