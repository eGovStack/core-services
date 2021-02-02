package org.egov.pg.service.gateways.razorpay;

import static org.egov.pg.constants.TransactionAdditionalFields.BANK_ACCOUNT_NUMBER;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import org.json.JSONArray;
import org.json.JSONObject;
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
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

/**
 * Razorpay Gateway implementation
 */
@Component
@Slf4j
public class RazorpayGateway implements Gateway{

    private static final String GATEWAY_NAME = "RAZORPAY";
    private final String MERCHANT_ID;
    private final String SECURE_SECRET;
    private final String LOCALE;
    private final String CURRENCY;
    private RazorpayClient client;
    private final RestTemplate restTemplate;
    private final String MERCHANT_URL_PAY;
    private final String MERCHANT_URL_STATUS;
    private final String PAYMENT_CAPTURE;
    private final boolean ACTIVE;
    
 

    @Autowired
    public RazorpayGateway(RestTemplate restTemplate, ObjectMapper objectMapper, Environment environment) {
        this.restTemplate = restTemplate;
        
        ACTIVE = Boolean.valueOf(environment.getRequiredProperty("razorpay.active"));
        CURRENCY = environment.getRequiredProperty("razorpay.currency");
        LOCALE = environment.getRequiredProperty("razorpay.locale");
        MERCHANT_ID = environment.getRequiredProperty("razorpay.merchant.id");
        SECURE_SECRET = environment.getRequiredProperty("razorpay.merchant.secret.key");
        MERCHANT_URL_PAY = environment.getRequiredProperty("razorpay.url.debit");
        MERCHANT_URL_STATUS = environment.getRequiredProperty("razorpay.url.status");
    	PAYMENT_CAPTURE = environment.getRequiredProperty("razorpay.payment_capture");
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
	  	 fields.put("amount", String.valueOf(Utils.formatAmtAsPaise(transaction.getTxnAmount())));
	        fields.put("merchant_key", MERCHANT_ID);
	        fields.put("locale", LOCALE);
	        fields.put("currency", CURRENCY);
	        fields.put("returnURL", transaction.getCallbackUrl());
	        fields.put("merchTxnRef", transaction.getTxnId());
	        fields.put("payment_capture", PAYMENT_CAPTURE);
	        
	        JSONObject request = new JSONObject();
			request.put("amount", String.valueOf(Utils.formatAmtAsPaise(transaction.getTxnAmount())));
			request.put("payment_capture", PAYMENT_CAPTURE);
			request.put("currency", CURRENCY);
			JSONArray transfers = new JSONArray();
			JSONObject transfer = new JSONObject();
			transfer.put("amount", String.valueOf(Utils.formatAmtAsPaise(transaction.getTxnAmount())));
			transfer.put("currency", CURRENCY);
			transfer.put("account", "acc_GUEHwDC08s1AgU");
			JSONObject notesData=new JSONObject();
	        notesData.put("Address","Moali");
	        notesData.put("ConsumerNumber","123");
	        notesData.put("ConsumerName","Aarif");
//	        notesData.put("ServiceType",receiptHeader.getDisplayMsg());
	        notesData.put("ReceiptId",transaction.getReceipt());
	        request.put("notes", notesData);
	     	transfers.put(transfer);
			request.put("transfers", transfers);

			Order order = null;
			try {
				order = client.Orders.create(request);
			} catch (RazorpayException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

	        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
	        fields.forEach(params::add);
	        String ENCRYPTION_TYPE = "SHA256";
	        params.add("secureHashType", ENCRYPTION_TYPE);
	        params.add("orderId", order.get("id"));
	        params.add("amount", String.valueOf(Utils.formatAmtAsPaise(transaction.getTxnAmount())));
	        
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

            ResponseEntity<RazorpayClient> response = restTemplate.exchange("https://api.razorpay.com/v1/"+currentStatus.getTxnId(), HttpMethod.GET, httpEntity, RazorpayClient.class);


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
