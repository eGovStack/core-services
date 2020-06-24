package org.egov.chat.service;

import lombok.extern.slf4j.Slf4j;
import org.egov.chat.config.graph.TopicNameGetter;
import org.egov.chat.models.EgovChat;
import org.egov.chat.util.CommonAPIErrorMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class InputSegregator {

    @Value("${topic.name.prefix}")
    private String topicNamePrefix;
    @Value("${root.question.topic}")
    private String rootQuestionTopic;
    @Value("${multilingual.support}")
    private boolean multilingualSupport;

    private String languageNode = "language";

    @Autowired
    private TopicNameGetter topicNameGetter;
    @Autowired
    private KafkaTemplate<String, EgovChat> kafkaTemplate;
    @Autowired
    private CommonAPIErrorMessage commonAPIErrorMessage;
    @Autowired
    private WelcomeMessageHandler welcomeMessageHandler;
    @Autowired
    private MultiLanguageService multiLanguageService;

    public void segregateAnswer(String consumerRecordKey, EgovChat chatNode) {
        try {
            String activeNodeId = chatNode.getConversationState().getActiveNodeId();
            log.debug("Active Node Id : " + activeNodeId);
            String topic = getOutputTopicName(activeNodeId);
            if(activeNodeId == null && multilingualSupport && multiLanguageService.askForLanguage(chatNode)) {
                    topic = topicNamePrefix + "language-question";
            } else if(languageNode.equalsIgnoreCase(activeNodeId)) {
                if(multiLanguageService.isValidInput(chatNode)) {
                    multiLanguageService.updateLocale(chatNode);
                }
            }

            if((multilingualSupport && languageNode.equalsIgnoreCase(activeNodeId))
                || (!multilingualSupport && activeNodeId == null)) {
                chatNode = welcomeMessageHandler.welcomeUser(consumerRecordKey, chatNode);
                if (chatNode == null)
                    return;
            }

            kafkaTemplate.send(topic, consumerRecordKey, chatNode);
        } catch (Exception e) {
            log.error("error in input segregator" + e.getLocalizedMessage());
            if (chatNode != null)
                commonAPIErrorMessage.resetFlowDuetoError(chatNode);
        }
    }

    private String getOutputTopicName(String activeNodeId) {
        String topic;
        if (activeNodeId == null)
            topic = topicNamePrefix + rootQuestionTopic;
        else
            topic = topicNameGetter.getAnswerInputTopicNameForNode(activeNodeId);
        return topic;
    }

}
