package org.egov.chat.service.validation;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;
import lombok.extern.slf4j.Slf4j;
import org.egov.chat.config.JsonPointerNameConstants;
import org.egov.chat.models.EgovChat;
import org.egov.chat.models.Message;
import org.egov.chat.repository.MessageRepository;
import org.egov.chat.service.FixedSetValues;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Iterator;
import java.util.List;

@Slf4j
@Component
public class Validator {

    @Autowired
    private TypeValidator typeValidator;
    @Autowired
    private FixedSetValues fixedSetValues;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    List<CustomValidator> customValidators;

    public boolean isValid(JsonNode config, EgovChat chatNode) {
        try {
            if (!(config.get("validationRequired") != null && config.get("validationRequired").asText()
                    .equalsIgnoreCase("true"))) {
                chatNode.getMessage().setValid(true);
                return true;
            }

            if (!typeValidator.isValid(config, chatNode)) {
                chatNode.getMessage().setValid(false);
                return false;
            }

            if (config.get("validationRequired") != null && config.get("validationRequired").asText().equalsIgnoreCase("true")) {
                if(config.get("customValidator") != null) {
                    CustomValidator customValidator = getCustomValidator(config);
                    JsonNode jsonNode = objectMapper.valueToTree(chatNode);
                    ObjectNode params = createParamsToFetchValues(config, jsonNode);
                    boolean isValid = customValidator.isValid(params);
                    //if invalid set valid to false and return
                    if(!isValid) {
                        chatNode.getMessage().setValid(isValid);
                        return isValid;
                    }
                }

                if (config.get("typeOfValues") != null) {
                    String validatorType = config.get("typeOfValues").asText();
                    if (validatorType.equalsIgnoreCase("FixedSetValues")) {
                        boolean valid = fixedSetValues.isValid(config, chatNode);
                        chatNode.getMessage().setValid(valid);
                        return valid;
                    }
                }
            }
            chatNode.getMessage().setValid(true);
            return true;
        } catch (Exception e) {
            log.error("Error in validator" + e.getLocalizedMessage() + " for Node : " + config.get("name").asText());
            chatNode.getMessage().setValid(false);
            return false;
        }
    }


    ObjectNode createParamsToFetchValues(JsonNode config, JsonNode chatNode) {
        ObjectMapper mapper = new ObjectMapper(new JsonFactory());
        ObjectNode params = mapper.createObjectNode();

        ObjectNode paramConfigurations = (ObjectNode) config.get("customValidator").get("params");
        Iterator<String> paramKeys = paramConfigurations.fieldNames();

        while (paramKeys.hasNext()) {
            String key = paramKeys.next();
            JsonNode paramValue;

            String paramConfiguration = paramConfigurations.get(key).asText();

            if (paramConfiguration.substring(0, 1).equalsIgnoreCase("/")) {
                paramValue = chatNode.at(paramConfiguration);
            } else if (paramConfiguration.substring(0, 1).equalsIgnoreCase("~")) {
                String nodeId = paramConfiguration.substring(1);
                String conversationId = chatNode.at(JsonPointerNameConstants.conversationId).asText();
                List<Message> messages = messageRepository.getValidMessagesOfConversation(conversationId);
                paramValue = TextNode.valueOf(findMessageForNode(messages, nodeId, chatNode));
            } else {
                paramValue = TextNode.valueOf(paramConfiguration);
            }

            params.set(key, paramValue);
        }

        return params;
    }

    String findMessageForNode(List<Message> messages, String nodeId, JsonNode chatNode) {
        for (Message message : messages) {
            if (message.getNodeId().equalsIgnoreCase(nodeId)) {
                return message.getMessageContent();
            }
        }
        //If nodeId isn't found in previously saved messages in DB
        //Try to find in the last received message
        if (chatNode.at("/message/nodeId").asText().equalsIgnoreCase(nodeId)) {
            return chatNode.at("/message/messageContent").asText();
        }
        return null;
    }

    CustomValidator getCustomValidator(JsonNode config) {
        String className = config.get("customValidator").get("class").asText();
        for (CustomValidator customValidator : customValidators) {
            if (customValidator.getClass().getName().equalsIgnoreCase(className))
                return customValidator;
        }
        return null;
    }


}
