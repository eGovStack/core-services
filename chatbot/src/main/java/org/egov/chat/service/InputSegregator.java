package org.egov.chat.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.egov.chat.config.graph.TopicNameGetter;
import org.egov.chat.models.EgovChat;
import org.egov.chat.repository.ConversationStateRepository;
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

    public void segregateAnswer(ConsumerRecord<String, JsonNode> consumerRecord) {
        try {
            EgovChat chatNode = objectMapper.convertValue(consumerRecord.value(), EgovChat.class);
            String conversationId = chatNode.getConversationState().getConversationId();

            String activeNodeId = conversationStateRepository.getActiveNodeIdForConversation(conversationId);

            log.debug("Active Node Id : " + activeNodeId);

            String topic = getOutputTopcName(activeNodeId);

            kafkaTemplate.send(topic, consumerRecord.key(), chatNode);
        } catch (Exception e) {
            log.error(e.getMessage());
        }
    }

    private String getOutputTopcName(String activeNodeId) {
        String topic;
        if (activeNodeId == null)
            topic = rootQuestionTopic;
        else
            topic = topicNameGetter.getAnswerInputTopicNameForNode(activeNodeId);
        return topic;
    }

}
