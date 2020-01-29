package org.egov.chat.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.egov.chat.config.JsonPointerNameConstants;
import org.egov.chat.repository.ConversationStateRepository;
import org.egov.chat.service.valuefetch.ValueFetcher;
import org.egov.chat.util.NumeralLocalization;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class QuestionGenerator {

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private ValueFetcher valueFetcher;
    @Autowired
    private FixedSetValues fixedSetValues;
    @Autowired
    private ConversationStateRepository conversationStateRepository;
    @Autowired
    private NumeralLocalization numeralLocalization;

    public void fillQuestion(JsonNode config, JsonNode chatNode) {

        ObjectNode localizationCode = objectMapper.createObjectNode();
        localizationCode.put("code", getQuesitonForConfig(config));
        ArrayNode localizationCodesArrayNode = objectMapper.createArrayNode();
        localizationCodesArrayNode.add(localizationCode);

        localizationCodesArrayNode.addAll(getOptionsForConfig(config, chatNode));

        // check if response object already created in case of error
        if(chatNode.has("response")&&chatNode.at("/response").has("localizationCodes")){
            ArrayNode responseLocalisationCodes= (ArrayNode) chatNode.at("/response/localizationCodes");
            ObjectNode newlineNode = objectMapper.createObjectNode();
            newlineNode.put("value", "\n");
            responseLocalisationCodes.add(newlineNode);
            responseLocalisationCodes.addAll(localizationCodesArrayNode);
            ObjectNode response= (ObjectNode) chatNode.at("/response");
            response.set("localizationCodes", responseLocalisationCodes);
            ((ObjectNode) chatNode).set("response", response);
        }
        else {
            ObjectNode response = objectMapper.createObjectNode();
            response.put("type", "text");
            response.set("localizationCodes", localizationCodesArrayNode);
            ((ObjectNode) chatNode).set("response", response);
        }

    }

    private String getQuesitonForConfig(JsonNode config) {
        return config.get("message").asText();
    }

    // TODO : Re-factor
    private ArrayNode getOptionsForConfig(JsonNode config, JsonNode chatNode) {
        ArrayNode localizationCodes = objectMapper.createArrayNode();

        if(config.get("typeOfValues") != null && config.get("typeOfValues").asText().equalsIgnoreCase("FixedSetValues")) {

            if(config.get("displayValuesAsOptions") != null && config.get("displayValuesAsOptions").asText().equalsIgnoreCase("true")) {

                boolean reQuestion = chatNode.get("reQuestion") != null && chatNode.get("reQuestion").asBoolean();
                JsonNode questionDetails;
                if(reQuestion) {
                    questionDetails = conversationStateRepository.getConversationStateForId(
                            chatNode.at(JsonPointerNameConstants.conversationId).asText()).getQuestionDetails();
                } else {
                    questionDetails = fixedSetValues.getAllValidValues(config, chatNode);
                }

                questionDetails = fixedSetValues.getNextSet(questionDetails);

                ( (ObjectNode) chatNode).set("questionDetails", questionDetails);

                ArrayNode values = (ArrayNode) questionDetails.get("askedValues");

                for(int i = 0; i < values.size(); i++) {
                    String tempString = "";
                    JsonNode value = values.get(i);
                    tempString += "\n";
                    if(config.get("values").isArray())
                        tempString += "*Send ";
                    tempString += value.get("index").asText()+"*";
                    if(config.get("values").isArray())
                        tempString += " to ";
                    else
                        tempString += ". ";

                    localizationCodes.addAll(numeralLocalization.getLocalizationCodesForStringContainingNumbers(tempString));
                    localizationCodes.add(value.get("value"));
                }
            } else {

                JsonNode questionDetails = fixedSetValues.getAllValidValues(config, chatNode);
                ( (ObjectNode) chatNode).set("questionDetails", questionDetails);

            }

            if(config.get("displayOptionsInExternalLink") != null && config.get("displayOptionsInExternalLink").asBoolean()) {
                ObjectNode externalLink = objectMapper.createObjectNode();
                externalLink.put("value", valueFetcher.getExternalLinkForParams(config, chatNode));
                localizationCodes.add(externalLink);
            }
        }

        return localizationCodes;
    }

}
