package org.egov.chat.service.streams;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.StreamsConfig;
import org.apache.kafka.streams.kstream.Consumed;
import org.apache.kafka.streams.kstream.KStream;
import org.apache.kafka.streams.kstream.Produced;
import org.egov.chat.config.KafkaStreamsConfig;
import org.egov.chat.config.graph.TopicNameGetter;
import org.egov.chat.models.ConversationState;
import org.egov.chat.models.EgovChat;
import org.egov.chat.models.Response;
import org.egov.chat.models.egovchatserdes.EgovChatSerdes;
import org.egov.chat.service.AnswerStore;
import org.egov.chat.service.proxybot.ProxyBot;
import org.egov.chat.util.CommonAPIErrorMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Properties;

@Slf4j
@Component
public class CreateProxyBotStream extends CreateStream {

    @Autowired
    private ProxyBot proxyBot;
    @Autowired
    private AnswerStore answerStore;
    @Autowired
    private TopicNameGetter topicNameGetter;
    @Autowired
    private CommonAPIErrorMessage commonAPIErrorMessage;
    @Autowired
    private KafkaStreamsConfig kafkaStreamsConfig;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private KafkaTemplate<String, EgovChat> kafkaTemplate;

    public void createProxyBotStream(JsonNode config, String inputTopic, String sendMessageTopic, String nextNodeTopic) {

        String streamName = config.get("name").asText() + "-proxy";

        Properties streamConfiguration = kafkaStreamsConfig.getDefaultStreamConfiguration();
        streamConfiguration.put(StreamsConfig.APPLICATION_ID_CONFIG, streamName);

        StreamsBuilder builder = new StreamsBuilder();
        KStream<String, EgovChat> kStream = builder.stream(inputTopic, Consumed.with(Serdes.String(),
                EgovChatSerdes.getSerde()));


        kStream.flatMapValues(chatNode -> {

            try {

                ObjectNode proxyBotResponse = proxyBot.makeProxyCall(config, chatNode);

                log.info("ProxyBotResponse : " + proxyBotResponse.toString());

                boolean continueProxy = proxyBotResponse.get("continue").asBoolean();

                if(continueProxy) {
                    JsonNode responseJson = proxyBotResponse.get("response");
                    Response response = objectMapper.convertValue(responseJson, Response.class);
                    response.setNodeId(config.get("name").asText());
                    response.setTimestamp(System.currentTimeMillis());
                    chatNode.setResponse(response);

                    JsonNode questionDetails = proxyBotResponse.get("questionDetails");

                    ConversationState nextConversationState = chatNode.getConversationState().toBuilder().build();
                    nextConversationState.setLastModifiedTime(System.currentTimeMillis());
                    nextConversationState.setActiveNodeId(config.get("name").asText());
                    nextConversationState.setQuestionDetails(questionDetails);
                    chatNode.setNextConversationState(nextConversationState);

                    conversationStateRepository.updateConversationStateForId(nextConversationState);

                } else {
                    JsonNode data = proxyBotResponse.get("data");

                    chatNode.getMessage().setMessageContent(data.toString());

                    answerStore.saveAnswer(config, chatNode);

                    kafkaTemplate.send(nextNodeTopic, chatNode);
                    return Collections.emptyList();
                }

            } catch (Exception e) {
                log.error("Error in ProxyBot Stream ", e);
            }

            return Collections.singleton(chatNode);
        }).to(sendMessageTopic, Produced.with(Serdes.String(), EgovChatSerdes.getSerde()));

        kafkaStreamsConfig.startStream(builder, streamConfiguration);

        log.info("ProxyBotStream started : " + streamName + " from : " + inputTopic + ", to : " + nextNodeTopic);

    }

}
