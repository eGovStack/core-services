package org.egov.chat.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.text.similarity.JaccardSimilarity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Slf4j
@Component
public class URLShorteningSevice {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${egov.urlshortner.host}")
    private String egovhost;

    @Value("${egov.urlshortner.endpoint}")
    private String shortenURLendpoint;

    public String shortenURL(String url)
    {
        ObjectNode requestbody=objectMapper.createObjectNode();
        requestbody.put("url",url);
        String shortenedURL = restTemplate.postForObject(egovhost+shortenURLendpoint,
                requestbody, String.class);
        return shortenedURL;
    }

}
