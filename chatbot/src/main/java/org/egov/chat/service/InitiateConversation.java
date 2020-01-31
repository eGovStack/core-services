package org.egov.chat.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.StreamsConfig;
import org.apache.kafka.streams.kstream.Consumed;
import org.apache.kafka.streams.kstream.KStream;
import org.apache.kafka.streams.kstream.Produced;
import org.egov.chat.config.KafkaStreamsConfig;
import org.egov.chat.models.ConversationState;
import org.egov.chat.models.EgovChat;
import org.egov.chat.models.egovchatserdes.EgovChatSerdes;
import org.egov.chat.repository.ConversationStateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Properties;
import java.util.UUID;

@Slf4j
@Service
public class InitiateConversation {

    private String streamName = "initiate-conversation";

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private KafkaStreamsConfig kafkaStreamsConfig;

    @Autowired
    private ConversationStateRepository conversationStateRepository;

    public void startStream(String inputTopic, String outputTopic) {

        Properties streamConfiguration = kafkaStreamsConfig.getDefaultStreamConfiguration();
        streamConfiguration.put(StreamsConfig.APPLICATION_ID_CONFIG, streamName);
        StreamsBuilder builder = new StreamsBuilder();
        KStream<String, EgovChat> messagesKStream = builder.stream(inputTopic, Consumed.with(Serdes.String(),
                EgovChatSerdes.getSerde()));

        messagesKStream.flatMapValues(chatNode -> {
            try {
                return Collections.singletonList(createOrContinueConversation(chatNode));
            } catch (Exception e) {
                log.error(e.getMessage());
                return Collections.emptyList();
            }
        }).to(outputTopic, Produced.with(Serdes.String(), EgovChatSerdes.getSerde()));

        kafkaStreamsConfig.startStream(builder, streamConfiguration);

        log.info(streamName + " stream started");
    }

    public EgovChat createOrContinueConversation(EgovChat chatNode) {

        String userId = chatNode.getUser().getUserId();

        ConversationState conversationState = conversationStateRepository.getConversationStateForUserId(userId);

        if (conversationState == null) {
            conversationState = createNewConversationForUser(userId);
            conversationStateRepository.insertNewConversation(conversationState);
        }

        chatNode.setConversationState(conversationState);

        return chatNode;
    }

    private ConversationState createNewConversationForUser(String userId) {
        String conversationId = UUID.randomUUID().toString();
        return ConversationState.builder().conversationId(conversationId).userId(userId).active(true).locale("en_IN").build();
    }

}
