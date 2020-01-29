package org.egov.chat.service.validation;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import org.egov.chat.config.JsonPointerNameConstants;
import org.egov.chat.models.ConversationState;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class ConversationStartValidator {
    private List<String> conversationstartkeywords = Arrays.asList("Hi", "HI", "hi", "hey", "HEY", "Hey", "hello", "HELLO", "Hello");

    public boolean checkIfConversationStartKeyword(JsonNode chatNode) {
        String answer = chatNode.at(JsonPointerNameConstants.messageContent).asText();
        return (answer == null) ? false : conversationstartkeywords.contains(answer);
    }
}
