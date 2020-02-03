package org.egov.chat.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import lombok.extern.slf4j.Slf4j;
import org.egov.chat.models.EgovChat;
import org.egov.chat.models.LocalizationCode;
import org.egov.chat.models.Response;
import org.egov.chat.repository.ConversationStateRepository;
import org.egov.chat.service.valuefetch.ValueFetcher;
import org.egov.chat.util.NumeralLocalization;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

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

    public EgovChat getQuestion(JsonNode config, EgovChat chatNode) throws IOException {
        LocalizationCode localizationCode = LocalizationCode.builder().code(getQuesitonForConfig(config)).build();
        List<LocalizationCode> localizationCodeArray = new ArrayList<>();
        localizationCodeArray.add(localizationCode);
        localizationCodeArray.addAll(getOptionsForConfig(config, chatNode));

        Response response = Response.builder().timestamp(System.currentTimeMillis())
                .type("text").localizationCodes(localizationCodeArray).build();
        chatNode.setResponse(response);
        return chatNode;
    }

    private String getQuesitonForConfig(JsonNode config) {
        return config.get("message").asText();
    }

    // TODO : Re-factor
    private List<LocalizationCode> getOptionsForConfig(JsonNode config, EgovChat chatNode) throws IOException {
        List<LocalizationCode> localizationCodes = new ArrayList<>();

        if (config.get("typeOfValues") != null && config.get("typeOfValues").asText().equalsIgnoreCase("FixedSetValues")) {

            if (config.get("displayValuesAsOptions") != null && config.get("displayValuesAsOptions").asText().equalsIgnoreCase("true")) {

                boolean reQuestion = chatNode.isAskForNextBatch();
                JsonNode questionDetails;
                if (reQuestion) {
                    questionDetails = conversationStateRepository.getConversationStateForId(
                            chatNode.getConversationState().getConversationId()).getQuestionDetails();
                } else {
                    questionDetails = fixedSetValues.getAllValidValues(config, chatNode);
                }

                questionDetails = fixedSetValues.getNextSet(questionDetails);

                chatNode.getNextConversationState().setQuestionDetails(questionDetails);

                ArrayNode values = (ArrayNode) questionDetails.get("askedValues");

                for (int i = 0; i < values.size(); i++) {
                    String tempString = "";
                    JsonNode value = values.get(i);
                    tempString += "\n";
                    if (config.get("values").isArray())
                        tempString += "Type ";
                    tempString += value.get("index").asText();
                    if (config.get("values").isArray())
                        tempString += " to ";
                    else
                        tempString += ". ";

                    localizationCodes.addAll(numeralLocalization.getLocalizationCodesForStringContainingNumbers(tempString));
                    localizationCodes.add(objectMapper.convertValue(value.get("value"), LocalizationCode.class));
                }
            } else {

                JsonNode questionDetails = fixedSetValues.getAllValidValues(config, chatNode);
                chatNode.getNextConversationState().setQuestionDetails(questionDetails);

            }

            if (config.get("displayOptionsInExternalLink") != null && config.get("displayOptionsInExternalLink").asBoolean()) {
                localizationCodes.add(LocalizationCode.builder().value(valueFetcher.getExternalLinkForParams(config, chatNode)).build());
            }
        }

        return localizationCodes;
    }

}
