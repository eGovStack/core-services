package org.egov.chat.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import org.egov.chat.ChatBot;
import org.egov.chat.controller.GraphStreamGenerator;
import org.egov.chat.models.EgovChat;
import org.egov.chat.repository.ConversationStateRepository;
import org.egov.chat.service.validation.Validator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Service
public class MultiLanguageService {

    @Autowired
    private Validator validator;
    @Autowired
    private AnswerExtractor answerExtractor;
    @Autowired
    private ConversationStateRepository conversationStateRepository;

    @Value("#{'${supported.locales}'.split(',')}")
    private List<String> supportedLocales;

    private String rootFolder = "graph/";
    private String languageNodeFileName = "language.yaml";

    private JsonNode languageConfig;

    @PostConstruct
    public void init() throws IOException {
        String pathToFile = rootFolder + languageNodeFileName;
        languageConfig = getConfigForFile(pathToFile);
    }

    public boolean askForLanguage(EgovChat chatNode) {
        return true;
    }

    public boolean isValidInput(EgovChat chatNode) {
        return validator.isValid(languageConfig, chatNode);
    }

    public void updateLocale(EgovChat chatNode) throws IOException {
        chatNode = answerExtractor.extractAnswer(languageConfig, chatNode);
        String locale = chatNode.getMessage().getMessageContent();
        chatNode.getConversationState().setLocale(locale);
        conversationStateRepository.updateConversationStateForId(chatNode.getConversationState());
    }

    private JsonNode getConfigForFile(String pathToFile) throws IOException {
        ObjectMapper mapper = new ObjectMapper(new YAMLFactory());
        JsonNode config = mapper.readTree(ChatBot.class.getClassLoader().getResource(pathToFile));
        return config;
    }

}
