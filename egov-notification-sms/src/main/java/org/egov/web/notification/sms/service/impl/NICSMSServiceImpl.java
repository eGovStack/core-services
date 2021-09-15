package org.egov.web.notification.sms.service.impl;


import lombok.extern.slf4j.*;
import org.egov.web.notification.sms.service.*;
import org.egov.web.notification.sms.config.SMSProperties;
import org.egov.web.notification.sms.models.Sms;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

import org.springframework.http.*;

import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.*;
import java.security.KeyStore;


@Service
@Slf4j
@ConditionalOnProperty(value = "sms.provider.class", matchIfMissing = true, havingValue = "NIC")
public class NICSMSServiceImpl extends BaseSMSService {

	
	@Value("${sms.url.dont_encode_url:true}") private boolean dontEncodeURL;
	 
	
	@Autowired
	SMSProperties smsProperties;
	
    public void submitToExternalSmsService(Sms sms) {
    	log.info("submitToExternalSmsService() start");
    	try {
        	String url = smsProperties.getUrl();
        	
            if (smsProperties.requestType.equals("POST")) {
                HttpEntity<MultiValueMap<String, String>> request = getRequest(sms);
                log.info("calling executeApi() method :: POST call");
                executeAPI(URI.create(url), HttpMethod.POST, request, String.class);

            } else {
                final MultiValueMap<String, String> requestBody = getSmsRequestBody(sms);

                URI final_url = UriComponentsBuilder.fromHttpUrl(url).queryParams(requestBody).build().encode().toUri();
                log.info("calling executeApi() method :: GET call");
                executeAPI(final_url, HttpMethod.GET, null, String.class);
            }
            
        } catch (RestClientException e) {
            log.error("Error occurred while sending SMS to " + sms.getMobileNumber(), e);
            throw e;
        }
    }


}
