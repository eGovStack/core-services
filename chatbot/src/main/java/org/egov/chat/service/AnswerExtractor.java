package org.egov.chat.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import me.xdrop.fuzzywuzzy.FuzzySearch;
import org.egov.chat.config.JsonPointerNameConstants;
import org.egov.chat.service.valuefetch.ValueFetcher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnswerExtractor {

    @Autowired
    private ValueFetcher valueFetcher;
    @Autowired
    private FixedSetValues fixedSetValues;

    public JsonNode extractAnswer(JsonNode config, JsonNode chatNode) {

        if(config.get("typeOfValues") != null && config.get("typeOfValues").asText().equalsIgnoreCase("FixedSetValues")) {
            chatNode = fixedSetValues.extractAnswer(config, chatNode);
        }

        return chatNode;
    }

}
