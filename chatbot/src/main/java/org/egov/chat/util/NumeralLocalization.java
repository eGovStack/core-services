package org.egov.chat.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class NumeralLocalization {

    @Autowired
    private ObjectMapper objectMapper;

    private String localizationPrefix = "chatbot.numbers.numeric";

    public ArrayNode getLocalizationCodesForStringContainingNumbers(String stringWithNumbers) {
        ArrayNode localizationCodes = objectMapper.createArrayNode();
        String tempString = "";
        for(char c : stringWithNumbers.toCharArray()) {
            if(Character.isDigit(c)) {
                if(! tempString.isEmpty()) {
                    localizationCodes.add(getLocalizationNodeForValue(tempString));
                    tempString = "";
                }
                localizationCodes.add(getLocalizationNodeForNumber(c));
            } else {
                tempString += c;
            }
        }
        if(! tempString.isEmpty()) {
            localizationCodes.add(getLocalizationNodeForValue(tempString));
        }
        return localizationCodes;
    }

    private JsonNode getLocalizationNodeForNumber(Character number) {
        ObjectNode objectNode = objectMapper.createObjectNode();
        objectNode.put("code", localizationPrefix + number);
        return objectNode;
    }

    private JsonNode getLocalizationNodeForValue(String value) {
        ObjectNode objectNode = objectMapper.createObjectNode();
        objectNode.put("value", value);
        return objectNode;
    }

}
