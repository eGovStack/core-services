package org.egov.chat.service.streams;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.StreamsConfig;
import org.apache.kafka.streams.kstream.Consumed;
import org.apache.kafka.streams.kstream.KStream;
import org.apache.kafka.streams.kstream.Produced;
import org.egov.chat.config.JsonPointerNameConstants;
import org.egov.chat.config.KafkaStreamsConfig;
import org.egov.chat.repository.ConversationStateRepository;
import org.egov.chat.service.ErrorMessageGenerator;
import org.egov.chat.service.QuestionGenerator;
import org.egov.chat.util.CommonAPIErrorMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Properties;

@Component
@Slf4j
public class CreateStream {

    @Autowired
    private KafkaStreamsConfig kafkaStreamsConfig;

    @Autowired
    protected ConversationStateRepository conversationStateRepository;

    @Autowired
    CommonAPIErrorMessage commonAPIErrorMessage;

    @Autowired
    protected QuestionGenerator questionGenerator;
    @Autowired
    private ErrorMessageGenerator errorMessageGenerator;

    public void createQuestionStreamForConfig(JsonNode config, String questionTopic, String sendMessageTopic) {

        String streamName = config.get("name").asText() + "-question";

        Properties streamConfiguration = kafkaStreamsConfig.getDefaultStreamConfiguration();
        streamConfiguration.put(StreamsConfig.APPLICATION_ID_CONFIG, streamName);

        StreamsBuilder builder = new StreamsBuilder();
        KStream<String, JsonNode> questionKStream = builder.stream(questionTopic, Consumed.with(Serdes.String(),
                kafkaStreamsConfig.getJsonSerde()));

        questionKStream.flatMapValues(chatNode -> {
            try {

                if(chatNode.has("errorMessage") && chatNode.get("errorMessage").asBoolean()) {
                    errorMessageGenerator.fillErrorMessageInNode(config, chatNode);
//                    if(errorMessageNode != null)
//                        responseNodes.add(errorMessageNode);
                }

                questionGenerator.fillQuestion(config, chatNode);

                JsonNode questionDetails = chatNode.get("questionDetails");

                conversationStateRepository.updateConversationStateForId(config.get("name").asText(),
                        questionDetails, chatNode.at(JsonPointerNameConstants.conversationId).asText());

                return Collections.singletonList(chatNode);
            } catch (Exception e) {
                log.error("error in question stream",e);
                return Collections.emptyList();
                // return Collections.singletonList(commonAPIErrorMessage.resetFlowDuetoError(chatNode));
            }
        }).to(sendMessageTopic, Produced.with(Serdes.String(), kafkaStreamsConfig.getJsonSerde()));

        kafkaStreamsConfig.startStream(builder, streamConfiguration);

        log.info("Stream started : " + streamName + ", from : " + questionTopic + ", to : " + sendMessageTopic);
    }

}
