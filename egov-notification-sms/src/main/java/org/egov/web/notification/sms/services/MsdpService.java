/*
 * eGov suite of products aim to improve the internal efficiency,transparency,
 * accountability and the service delivery of the government  organizations.
 *
 *  Copyright (C) 2016  eGovernments Foundation
 *
 *  The updated version of eGov suite of products as by eGovernments Foundation
 *  is available at http://www.egovernments.org
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see http://www.gnu.org/licenses/ or
 *  http://www.gnu.org/licenses/gpl.html .
 *
 *  In addition to the terms of the GPL license to be adhered to in using this
 *  program, the following additional terms are to be complied with:
 *
 *      1) All versions of this program, verbatim or modified must carry this
 *         Legal Notice.
 *
 *      2) Any misrepresentation of the origin of the material is prohibited. It
 *         is required that all modified versions of this material be marked in
 *         reasonable ways as different from the original version.
 *
 *      3) This license does not grant any rights to any user of the program
 *         with regards to rights under trademark law for use of the trade names
 *         or trademarks of eGovernments Foundation.
 *
 *  In case of any queries, you can reach eGovernments Foundation at contact@egovernments.org.
 */

package org.egov.web.notification.sms.services;


import lombok.extern.slf4j.Slf4j;
import org.apache.http.conn.ssl.NoopHostnameVerifier;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.conn.ssl.TrustStrategy;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.egov.web.notification.sms.config.SmsProperties;
import org.egov.web.notification.sms.models.Priority;
import org.egov.web.notification.sms.models.Sms;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import javax.net.ssl.SSLContext;
import java.nio.charset.StandardCharsets;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import static java.util.Objects.isNull;
import static org.springframework.util.StringUtils.isEmpty;


@Service
@Slf4j
@ConditionalOnProperty(value = "sms.enabled", havingValue = "true")
public class MsdpService implements SMSService {
    private static final Logger LOGGER = LoggerFactory.getLogger(MsdpService.class);

    private static final String SMS_RESPONSE_NOT_SUCCESSFUL = "Sms response not successful";

    private SmsProperties smsProperties;
    private RestTemplate restTemplate;

    @Value("${sms.sender.requestType:POST}")
    private String requestType;

    @Value("${sms.verify.response:false}")
    private boolean verifyResponse;

    @Value("${sms.print.response:false}")
    private boolean printResponse;


    @Value("${sms.verify.responseContains:}")
    private String verifyResponseContains;

    @Value("${sms.verify.ssl:true}")
    private boolean verifySSL;

    @Value("${sms.url.dont_encode_url:true}")
    private boolean dontEncodeURL;

    @Value("${sms.sender.secure.key:}")
    private String secureKey;

    private final String passwordMD5;


    @Autowired
    public MsdpService(SmsProperties smsProperties, RestTemplate restTemplate) {

        this.smsProperties = smsProperties;
        this.restTemplate = restTemplate;
        this.passwordMD5 = MD5(smsProperties.getPassword());

        if (!verifySSL) {
            TrustStrategy acceptingTrustStrategy = new TrustStrategy() {
                @Override
                public boolean isTrusted(java.security.cert.X509Certificate[] x509Certificates, String s) {
                    return true;
                }

            };

            SSLContext sslContext = null;
            try {
                sslContext = org.apache.http.ssl.SSLContexts.custom().loadTrustMaterial(null, acceptingTrustStrategy)
                        .build();
            } catch (NoSuchAlgorithmException e) {
                e.printStackTrace();
            } catch (KeyManagementException e) {
                e.printStackTrace();
            } catch (KeyStoreException e) {
                e.printStackTrace();
            }
            SSLConnectionSocketFactory csf = new SSLConnectionSocketFactory(sslContext, new NoopHostnameVerifier());
            CloseableHttpClient httpClient = HttpClients.custom().setSSLSocketFactory(csf).build();
            HttpComponentsClientHttpRequestFactory requestFactory = new HttpComponentsClientHttpRequestFactory();
            requestFactory.setHttpClient(httpClient);
            restTemplate.setRequestFactory(requestFactory);
        }
    }

    @Override
    public void sendSMS(Sms sms) {
        if (!sms.isValid()) {
            LOGGER.error(String.format("Sms %s is not valid", sms));
            return;
        }
        submitToExternalSmsService(sms);
    }

    private void submitToExternalSmsService(Sms sms) {
        try {
            
            String url = smsProperties.getSmsProviderURL();
            ResponseEntity<String> response = new ResponseEntity<String>(HttpStatus.OK);
            if (requestType.equals("POST"))
            {
                HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(getRequestMap(sms), getHttpHeaders());
                response = restTemplate.postForEntity(url, request, String.class);

                if (printResponse)
                    log.debug("Response from API", response.getBody());

                if (isResponseCodeInKnownErrorCodeList(response)) {
                    throw new RuntimeException(SMS_RESPONSE_NOT_SUCCESSFUL);
                }
            } else {
               final MultiValueMap<String, String> requestBody = getRequestMap(sms);


               String final_url = UriComponentsBuilder.fromHttpUrl(url).queryParams(requestBody).toUriString();

               if (dontEncodeURL) {
                   final_url = final_url.replace("%20", " ").replace("%2B", "+");
               }

               String responseString = restTemplate.getForObject(final_url, String.class);

                if (printResponse)
                    log.debug("Response from API", response.getBody());

               if (verifyResponse && !responseString.contains(verifyResponseContains)) {
                   LOGGER.error("Response from API - " + responseString);
                   throw new RuntimeException(SMS_RESPONSE_NOT_SUCCESSFUL);
               }
            }

        } catch (RestClientException e) {
            LOGGER.error("Error occurred while sending SMS to " + sms.getMobileNumber(), e);
            throw e;
        }
    }

    private boolean isResponseCodeInKnownErrorCodeList(ResponseEntity<?> response) {
        final String responseCode = Integer.toString(response.getStatusCodeValue());
        return smsProperties.getSmsErrorCodes().stream().anyMatch(errorCode -> errorCode.equals(responseCode));
    }

    private MultiValueMap<String, String> getRequestMap(Sms sms){
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add(smsProperties.getUserParameterName(), smsProperties.getUserName());
        map.add(smsProperties.getSenderIdParameterName(), smsProperties.getSmsSender());
        map.add(smsProperties.getMobileNumberParameterName(), sms.getMobileNumber());
        
        //message is assumed to be splited in three parts first part is actual message, second part template_id and third part entity_code
        
        log.info("actual message extracted: "+sms.getMessage());
        
        String msgs[]=sms.getMessage().split("\\|"); 
        String dlt_entity_id="1301157492438182299";
        String dlt_template_id="123";
       
        
        String msg=msgs[0];
        
        if(msgs.length>1)
            dlt_entity_id=msgs[1];
        
        if(msgs.length>2)
            dlt_template_id=msgs[2];
       
        log.info("filetered message:"+msg);
        log.info("dlt_entity_id:"+dlt_entity_id);
        log.info("dlt_template_id:"+dlt_template_id);
        
        
        map.add(smsProperties.getMessageParameterName(),msg );
        map.add(smsProperties.getEntityParameterName(),dlt_entity_id);
        map.add(smsProperties.getTemplateParameterName(),dlt_template_id);
         
        
        map.add("smsservicetype", getPriority(sms));
        map.setAll(smsProperties.getExtraRequestParameters());

        if( ! isEmpty(this.secureKey)){
            map.add(smsProperties.getPasswordParameterName(), this.passwordMD5);
            map.add("key", hashGenerator(smsProperties.getUserName(), smsProperties.getSmsSender(), sms.getMessage(),
                    this.secureKey));
        } else
            map.add(smsProperties.getPasswordParameterName(), smsProperties.getPassword());

        return map;
    }

    private static String getPriority(Sms sms){
        if( ! isNull(sms.getPriority()) && sms.getPriority().equals(Priority.HIGH))
            return "otpmsg";
         else
            return "unicodemsg";
    }

    private HttpHeaders getHttpHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        return headers;
    }

    private static String MD5(String text) {
        MessageDigest md;
        byte[] md5 = new byte[64];
        try {
            md = MessageDigest.getInstance("SHA-1");
            md.update(text.getBytes(StandardCharsets.ISO_8859_1), 0, text.length());
            md5 = md.digest();
        }catch(Exception e) {
            log.error("Exception while encrypting the pwd: ",e);
        }
        return convertedToHex(md5);

    }

    private static String convertedToHex(byte[] data) {
        StringBuilder buf = new StringBuilder();

        for (byte aData : data) {
            int halfOfByte = (aData >>> 4) & 0x0F;
            int twoHalfBytes = 0;

            do {
                if (0 <= halfOfByte && halfOfByte <= 9)
                    buf.append((char) ('0' + halfOfByte));
                else
                    buf.append((char) ('a' + (halfOfByte - 10)));

                halfOfByte = aData & 0x0F;

            } while (twoHalfBytes++ < 1);
        }
        return buf.toString();
    }

    private String hashGenerator(String userName, String senderId, String content, String secureKey) {
        String hashGen = userName.trim() + senderId.trim() + content.trim() + secureKey.trim();
        StringBuilder sb = new StringBuilder();
        MessageDigest md;
        try {
            md = MessageDigest.getInstance("SHA-512");
            md.update(hashGen.getBytes());
            byte byteData[] = md.digest();
            // convert the byte to hex format method 1
            for (byte aByteData : byteData) {
                sb.append(Integer.toString((aByteData & 0xff) + 0x100, 16).substring(1));
            }

        } catch (Exception e) {
            log.error("Exception while generating the hash: ", e);
        }
        return sb.toString();
    }
}
