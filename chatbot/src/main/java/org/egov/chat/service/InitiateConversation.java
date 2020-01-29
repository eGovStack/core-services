package org.egov.chat.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang.StringUtils;
import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.StreamsConfig;
import org.apache.kafka.streams.kstream.Consumed;
import org.apache.kafka.streams.kstream.KStream;
import org.apache.kafka.streams.kstream.Produced;
import org.egov.chat.config.JsonPointerNameConstants;
import org.egov.chat.config.KafkaStreamsConfig;
import org.egov.chat.models.ConversationState;
import org.egov.chat.repository.ConversationStateRepository;
import org.egov.chat.util.CommonAPIErrorMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
public class InitiateConversation {

    private String streamName = "initiate-conversation";

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private KafkaStreamsConfig kafkaStreamsConfig;

    @Autowired
    CommonAPIErrorMessage commonAPIErrorMessage;

    @Autowired
    private ConversationStateRepository conversationStateRepository;

    public void startStream(String inputTopic, String outputTopic) {

        Properties streamConfiguration = kafkaStreamsConfig.getDefaultStreamConfiguration();
        streamConfiguration.put(StreamsConfig.APPLICATION_ID_CONFIG, streamName);
        StreamsBuilder builder = new StreamsBuilder();
        KStream<String, JsonNode> messagesKStream = builder.stream(inputTopic, Consumed.with(Serdes.String(),
                kafkaStreamsConfig.getJsonSerde()));

        messagesKStream.flatMapValues(chatNode -> {
            try {
                return Collections.singletonList(createOrContinueConversation(chatNode));
            } catch (Exception e) {
                log.error("error in initiate conversation",e);
                return Collections.emptyList();
                // return Collections.singletonList(commonAPIErrorMessage.resetFlowDuetoError(chatNode));
            }
        }).to(outputTopic, Produced.with(Serdes.String(), kafkaStreamsConfig.getJsonSerde()));

        kafkaStreamsConfig.startStream(builder, streamConfiguration);

        log.info(streamName + " stream started");
    }

    public JsonNode createOrContinueConversation(JsonNode chatNode) {

        String userId = chatNode.at(JsonPointerNameConstants.userId).asText();

        ConversationState conversationState = conversationStateRepository.getConversationStateForUserId(userId);

        if(conversationState == null) {
            conversationState = createNewConversationForUser(userId);
            conversationStateRepository.insertNewConversation(conversationState);
        }

        chatNode = ((ObjectNode) chatNode).set("conversationId",
                TextNode.valueOf(conversationState.getConversationId()));

        chatNode = ((ObjectNode) chatNode).set("conversationState", objectMapper.valueToTree(conversationState));

        return chatNode;
    }

    private ConversationState createNewConversationForUser(String userId) {
        String conversationId = UUID.randomUUID().toString();
        return ConversationState.builder().conversationId(conversationId).userId(userId).active(true).locale("en_IN").build();
    }

}
