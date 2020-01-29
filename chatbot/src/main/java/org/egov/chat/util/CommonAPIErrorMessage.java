package org.egov.chat.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.egov.chat.config.JsonPointerNameConstants;
import org.egov.chat.repository.ConversationStateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class CommonAPIErrorMessage {

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private ConversationStateRepository conversationStateRepository;
    @Autowired
    private KafkaTemplate<String, JsonNode> kafkaTemplate;

    private String commonapierrormessage = "chatbot.message.common.api.errormessage";
    private String resetTopic ="input-reset-check";

    public ObjectNode getErrorMessageResponse()
    {
        ObjectNode responseMessage = objectMapper.createObjectNode();
        responseMessage.put("type", "text");
        ArrayNode localizationCodesArrayNode = objectMapper.createArrayNode();
        ObjectNode param = objectMapper.createObjectNode();
        param.put("code", commonapierrormessage);
        localizationCodesArrayNode.add(param);
        responseMessage.set("localizationCodes", localizationCodesArrayNode);
        return responseMessage;
    }

    public void resetConversation(JsonNode chatNode){
        String conversationId = chatNode.at(JsonPointerNameConstants.conversationId).asText();
        conversationStateRepository.markConversationInactive(conversationId);
    }

    public JsonNode resetFlowDuetoError(JsonNode chatNode)
    {
        try{
            resetConversation(chatNode);
            ( (ObjectNode) chatNode).set("response", getErrorMessageResponse());
            return  chatNode;
        }
        catch (Exception ex){
            log.error("error occurred while sending user error response",ex);
        }
        return chatNode;
    }
}
