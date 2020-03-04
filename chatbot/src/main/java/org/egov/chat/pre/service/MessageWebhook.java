package org.egov.chat.pre.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.egov.chat.pre.formatter.RequestFormatter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class MessageWebhook {

    @Autowired
    private RequestFormatter requestFormatter;
    @Autowired
    private KafkaTemplate<String, JsonNode> kafkaTemplate;

    private String outputTopicName = "transformed-input-messages";

    public Object receiveMessage(JsonNode message) throws Exception {

        if(requestFormatter.isValid(message)) {
            ((ObjectNode) message).put("timestamp", System.currentTimeMillis());
            message = requestFormatter.getTransformedRequest(message);
            String key = message.at("/user/mobileNumber").asText();
            kafkaTemplate.send(outputTopicName, key, message);
        } else {

        }

        return null;
    }

    public void recordEvent() {

    }

}
