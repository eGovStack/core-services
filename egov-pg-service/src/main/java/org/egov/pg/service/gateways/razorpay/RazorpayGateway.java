package org.egov.pg.service.gateways.razorpay;

import java.net.URI;
import java.security.SignatureException;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import javax.xml.bind.DatatypeConverter;

import org.egov.pg.models.Transaction;
import org.egov.pg.service.Gateway;
import org.egov.tracer.model.ServiceCallException;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
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
    private final String MERCHANT_ID;//="rzp_test_kQ821qWPnYKZZr";
    private final String SECURE_SECRET;//="b4An5RWnpy3GtjyP1PpCXdf9";
    private final String LOCALE;
    private final String CURRENCY;
    private final String PAYMENT_CAPTURE;
    private RazorpayClient client;
    private final RestTemplate restTemplate;
    //private ObjectMapper objectMapper;
    private final String MERCHANT_URL_PAY;
    private final String MERCHANT_URL_STATUS;
    
    private final boolean ACTIVE;
    
 

    @Autowired
    public RazorpayGateway(RestTemplate restTemplate, ObjectMapper objectMapper, Environment environment) {
        this.restTemplate = restTemplate;
        //this.objectMapper = objectMapper;
        
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
		boolean generated_signature;
		JSONObject object = new JSONObject(params);
		
        try {
        	generated_signature = Utils.verifyPaymentSignature(object, SECURE_SECRET);
    		
        	Payment payment = client.Payments.fetch(params.get("razorpayPaymentId"));
			if (generated_signature) 
				{
			
	            return Transaction.builder()
	                    .txnId(currentStatus.getTxnId())
	                    .txnAmount(currentStatus.getTxnAmount())
	                    .txnStatus(Transaction.TxnStatusEnum.SUCCESS)
	                    .gatewayTxnId(payment.get("id"))
	                    .gatewayPaymentMode(payment.get("method"))
	                    .gatewayStatusCode(payment.get("status"))
	                    .gatewayStatusMsg(payment.get("description"))
	                    .responseJson(payment)
	                    .build();
				}
			else
				{
	            return Transaction.builder()
	            		.txnId(currentStatus.getTxnId())
	                    .txnAmount(currentStatus.getTxnAmount())
	                    .txnStatus(Transaction.TxnStatusEnum.SUCCESS)
	                    .gatewayTxnId(payment.get("id"))
	                    .gatewayPaymentMode(payment.get("method"))
	                    .gatewayStatusCode(payment.get("status"))
	                    .gatewayStatusMsg(payment.get("description"))
	                    .responseJson(payment)
	                    .build();
				}
        	
			
        } catch (Exception e){
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
	
}
