package org.egov.chat.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.egov.chat.config.JsonPointerNameConstants;
import org.egov.chat.config.graph.TopicNameGetter;
import org.egov.chat.repository.ConversationStateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class InputSegregator {

    private String rootAnswerTopic = "root-answer";

    @Autowired
    private ConversationStateRepository conversationStateRepository;
    @Autowired
    private TopicNameGetter topicNameGetter;
    @Autowired
    private KafkaTemplate<String, JsonNode> kafkaTemplate;

    public void segregateAnswer(ConsumerRecord<String, JsonNode> consumerRecord) {
        try {
            JsonNode chatNode = consumerRecord.value();
            String conversationId = chatNode.at(JsonPointerNameConstants.conversationId).asText();

            String activeNodeId = conversationStateRepository.getActiveNodeIdForConversation(conversationId);

            log.debug("Active Node Id : " + activeNodeId);

            String topic = getOutputTopcName(activeNodeId);

            kafkaTemplate.send(topic, consumerRecord.key(), chatNode);
        } catch (Exception e) {
            log.error("input segregator error",e);
        }
    }

    private String getOutputTopcName(String activeNodeId) {
        String topic;
        if(activeNodeId == null)
            topic = rootAnswerTopic;
        else
            topic = topicNameGetter.getAnswerInputTopicNameForNode(activeNodeId);
        return topic;
    }

}
