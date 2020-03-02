package org.egov.chat.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.egov.chat.config.graph.TopicNameGetter;
import org.egov.chat.models.EgovChat;
import org.egov.chat.repository.ConversationStateRepository;
import org.egov.chat.util.CommonAPIErrorMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class InputSegregator {

    private String rootQuestionTopic = "root-question";

    @Autowired
    private ConversationStateRepository conversationStateRepository;
    @Autowired
    private TopicNameGetter topicNameGetter;
    @Autowired
    private KafkaTemplate<String, EgovChat> kafkaTemplate;
    @Autowired
    ObjectMapper objectMapper;
    @Autowired
    private CommonAPIErrorMessage commonAPIErrorMessage;
    @Autowired
    private WelcomeMessageHandler welcomeMessageHandler;

    public void segregateAnswer(ConsumerRecord<String, JsonNode> consumerRecord) {
        EgovChat chatNode=null;
        try {
            chatNode = objectMapper.convertValue(consumerRecord.value(), EgovChat.class);

            String activeNodeId = chatNode.getConversationState().getActiveNodeId();

            log.debug("Active Node Id : " + activeNodeId);

            if(activeNodeId == null) {
                chatNode = welcomeMessageHandler.welcomeUser(chatNode, consumerRecord.key());
                if(chatNode == null)
                    return;
            }

            String topic = getOutputTopicName(activeNodeId);

            kafkaTemplate.send(topic, consumerRecord.key(), chatNode);
        } catch (Exception e) {
            log.error("error in input segregator",e);
            if(chatNode!=null)
                commonAPIErrorMessage.resetFlowDuetoError(chatNode);
        }
    }

    private String getOutputTopicName(String activeNodeId) {
        String topic;
        if (activeNodeId == null)
            topic = rootQuestionTopic;
        else
            topic = topicNameGetter.getAnswerInputTopicNameForNode(activeNodeId);
        return topic;
    }

}
