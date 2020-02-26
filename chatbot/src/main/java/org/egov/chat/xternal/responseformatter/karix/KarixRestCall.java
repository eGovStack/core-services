package org.egov.chat.xternal.responseformatter.karix;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@PropertySource("classpath:application.properties")
@Slf4j
@Service
public class KarixRestCall {

    @Value("${karix.send.message.url}")
    private String karixSendMessageUrl;

    @Value("${karix.authentication.token}")
    private String karixAuthenticationToken;

    @Autowired
    private RestTemplate restTemplate;

    public void sendMessage(JsonNode response) {
        try {
            HttpHeaders httpHeaders = getDefaultHttpHeaders();

            HttpEntity<JsonNode> request = new HttpEntity<>(response, httpHeaders);

            ResponseEntity<JsonNode> karixResponse = restTemplate.postForEntity(karixSendMessageUrl, request, JsonNode.class);

            // TODO : Remove delay after discussing with Karix
            Thread.sleep(2000);

            log.info("Karix Send Message Response : " + karixResponse.toString());
        } catch (Exception e) {
            log.error(e.getMessage());
        }

    }

    HttpHeaders getDefaultHttpHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authentication", karixAuthenticationToken);
        return headers;
    }


}
