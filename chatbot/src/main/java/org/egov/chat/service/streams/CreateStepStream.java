package org.egov.chat.service.streams;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.StreamsConfig;
import org.apache.kafka.streams.kstream.Consumed;
import org.apache.kafka.streams.kstream.KStream;
import org.apache.kafka.streams.kstream.Produced;
import org.egov.chat.config.KafkaStreamsConfig;
import org.egov.chat.service.AnswerExtractor;
import org.egov.chat.service.AnswerStore;
import org.egov.chat.service.validation.Validator;
import org.egov.chat.util.CommonAPIErrorMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Properties;

@Component
@Slf4j
public class CreateStepStream extends CreateStream {

    @Autowired
    private KafkaStreamsConfig kafkaStreamsConfig;

    @Autowired
    private Validator validator;
    @Autowired
    private AnswerExtractor answerExtractor;
    @Autowired
    private AnswerStore answerStore;
    @Autowired
    private KafkaTemplate<String, JsonNode> kafkaTemplate;
    @Autowired
    CommonAPIErrorMessage commonAPIErrorMessage;

    public void createEvaluateAnswerStreamForConfig(JsonNode config, String answerInputTopic, String answerOutputTopic, String questionTopic) {

        String streamName = config.get("name").asText() + "-answer";

        Properties streamConfiguration = kafkaStreamsConfig.getDefaultStreamConfiguration();
        streamConfiguration.put(StreamsConfig.APPLICATION_ID_CONFIG, streamName);

        StreamsBuilder builder = new StreamsBuilder();
        KStream<String, JsonNode> answerKStream = builder.stream(answerInputTopic, Consumed.with(Serdes.String(),
                kafkaStreamsConfig.getJsonSerde()));

        KStream<String, JsonNode>[] branches = answerKStream.branch(
                (key, chatNode) -> validator.isValid(config, chatNode),
                (key, value) -> true
        );

        branches[0].flatMapValues(chatNode -> {
            try {
                chatNode = answerExtractor.extractAnswer(config, chatNode);

                if(chatNode.get("reQuestion") != null && chatNode.get("reQuestion").asBoolean()) {
                    kafkaTemplate.send(questionTopic, chatNode);
                    return Collections.emptyList();
                }

                answerStore.saveAnswer(config, chatNode);

                return Collections.singletonList(chatNode);
            } catch (Exception e) {
                log.error("error in answer stream",e);
                return Collections.emptyList();
                // return Collections.singletonList(commonAPIErrorMessage.resetFlowDuetoError(chatNode));
            }
        }).to(answerOutputTopic, Produced.with(Serdes.String(), kafkaStreamsConfig.getJsonSerde()));

        branches[1].mapValues(chatNode -> {
            ( (ObjectNode) chatNode).put("errorMessage", true);
            return chatNode;
        }).to(questionTopic, Produced.with(Serdes.String(), kafkaStreamsConfig.getJsonSerde()));

        kafkaStreamsConfig.startStream(builder, streamConfiguration);

        log.info("Step Stream started : " + streamName + ", from : " + answerInputTopic + ", to : " + answerOutputTopic +
                " OR to : " + questionTopic);
    }

}
