package org.egov.chat.pre.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.egov.chat.models.*;
import org.egov.chat.pre.formatter.RequestFormatter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.Collections;
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

    public Object receiveMessage(Map<String, String> params) throws Exception {
        log.info("received message from provider: "+params);
        JsonNode message = prepareMessage(params);
        if(requestFormatter.isValid(message)) {
            message = requestFormatter.getTransformedRequest(message);
            String key = message.at("/user/mobileNumber").asText();

            JsonNode serverDownResponse = getResponseForChatbotDown(message);

            kafkaTemplate.send("send-message", key, serverDownResponse);

//            kafkaTemplate.send(outputTopicName, key, message);
        } else {
           log.info("fail to validate formater");
        }

        return null;
    }

    private JsonNode getResponseForChatbotDown(JsonNode incomingMessageNode) throws JsonProcessingException {

        String chatbotDownResponse = "mSeva Chatbot is down for scheduled maintenance right now. This will be up and running from 7th September 2020";

        EgovChat chatNode = objectMapper.treeToValue(incomingMessageNode, EgovChat.class);

        chatNode.setTenantId("pb");
        ConversationState conversationState = ConversationState.builder().locale("en_IN").build();
        chatNode.setConversationState(conversationState);

        Message message = chatNode.getMessage();
        message.setMessageId(UUID.randomUUID().toString());

        Response response = Response.builder().text(chatbotDownResponse).timestamp(System.currentTimeMillis()).type("text").build();
        chatNode.setResponse(response);

        return objectMapper.valueToTree(chatNode);
    }

    private JsonNode prepareMessage(Map<String, String> bodyParams) {
//        ObjectNode message = objectMapper.createObjectNode();
//        message.set("body", body);
        ObjectNode message = (ObjectNode) objectMapper.convertValue(bodyParams, JsonNode.class);
//        message.set("querParams", params);
        message.put("timestamp", System.currentTimeMillis());
        return message;
    }

    public void recordEvent() {

    }

}
