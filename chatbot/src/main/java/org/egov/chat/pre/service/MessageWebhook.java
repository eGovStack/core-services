package org.egov.chat.pre.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.NullNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.egov.chat.pre.formatter.RequestFormatter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
public class MessageWebhook {

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private RequestFormatter requestFormatter;
    @Autowired
    private KafkaTemplate<String, JsonNode> kafkaTemplate;

    private String outputTopicName = "transformed-input-messages";

    public ResponseEntity<JsonNode> receiveMessage(Map<String, String> queryParams) throws Exception {
        log.info("received message from provider: "+queryParams);
        JsonNode message = prepareMessage(queryParams);

        if(requestFormatter.isValid(message)) {
            JsonNode response = createResponse();
            recordEvent(message, response, 200);
            message = requestFormatter.getTransformedRequest(message);
            String key = message.at("/user/mobileNumber").asText();
            kafkaTemplate.send(outputTopicName, key, message);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            JsonNode response = createResponse();
            recordEvent(message, response, 400);
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    private JsonNode prepareMessage(Map<String, String> queryParams) {
        ObjectNode message = objectMapper.createObjectNode();
        message.set("body", NullNode.getInstance());
        JsonNode paramsJsonNode = objectMapper.convertValue(queryParams, JsonNode.class);
        message.set("queryParams", paramsJsonNode);
        message.put("timestamp", System.currentTimeMillis());
        return message;
    }

    private JsonNode createResponse() {
        ObjectNode objectNode = objectMapper.createObjectNode();
        objectNode.put("id", UUID.randomUUID().toString());
        return objectNode;
    }

    public void recordEvent(JsonNode message, JsonNode response, int statusCode) {
        try {
            JsonNode maskedRequest = requestFormatter.maskData(message);
            ObjectNode eventObject = objectMapper.createObjectNode();
            eventObject.put("id", UUID.randomUUID().toString());
            eventObject.set("request", maskedRequest);
            eventObject.set("response", response);
            eventObject.put("statusCode", statusCode);
            kafkaTemplate.send(requestFormatter.getEventTopicName(), eventObject);
        } catch (Exception e) {
            log.error("Error while recording receive message event : ", e);
        }
    }

}
