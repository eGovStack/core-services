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
import org.egov.chat.util.CommonAPIErrorMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Properties;
import java.util.UUID;

@Slf4j
@Service
public class InitiateConversation {

    @Autowired
    private ConversationStateRepository conversationStateRepository;

    public EgovChat createOrContinueConversation(EgovChat chatNode) {

        String userId = chatNode.getUser().getUserId();

        ConversationState conversationState = conversationStateRepository.getActiveConversationStateForUserId(userId);

        if(chatNode.isResetConversation() && conversationState != null) {
            String conversationId = conversationState.getConversationId();
            conversationState.setActiveNodeId(conversationState.getActiveNodeId() + "-reset");
            conversationStateRepository.updateConversationStateForId(conversationState);
            conversationStateRepository.markConversationInactive(conversationId);
            conversationState = null;
        }

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
