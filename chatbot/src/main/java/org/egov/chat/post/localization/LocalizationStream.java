package org.egov.chat.post.localization;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.StreamsConfig;
import org.apache.kafka.streams.kstream.Consumed;
import org.apache.kafka.streams.kstream.KStream;
import org.apache.kafka.streams.kstream.Produced;
import org.egov.chat.config.JsonPointerNameConstants;
import org.egov.chat.config.KafkaStreamsConfig;
import org.egov.chat.util.LocalizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Properties;

@Slf4j
@Component
public class LocalizationStream {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private KafkaStreamsConfig kafkaStreamsConfig;
    @Autowired
    private LocalizationService localizationService;

    public String getStreamName() {
        return "localization-stream";
    }

    public void startStream(String inputTopic, String outputTopic) {
        Properties streamConfiguration = kafkaStreamsConfig.getDefaultStreamConfiguration();
        streamConfiguration.put(StreamsConfig.APPLICATION_ID_CONFIG, getStreamName());
        StreamsBuilder builder = new StreamsBuilder();
        KStream<String, JsonNode> messagesKStream = builder.stream(inputTopic, Consumed.with(Serdes.String(),
                kafkaStreamsConfig.getJsonSerde()));

        messagesKStream.flatMapValues(chatNode -> {
            try {
                return Collections.singletonList(localizeMessage(chatNode));
            } catch (Exception e) {
                log.error("error in localisation stream",e);
                return Collections.emptyList();
            }
        }).to(outputTopic, Produced.with(Serdes.String(), kafkaStreamsConfig.getJsonSerde()));

        kafkaStreamsConfig.startStream(builder, streamConfiguration);

    }

    public JsonNode localizeMessage(JsonNode chatNode) throws IOException {
        String locale = chatNode.at(JsonPointerNameConstants.locale).asText();

        if(chatNode.get("response").has("localizationCodes")) {
            String message = "";
            ArrayNode localizationCodes = (ArrayNode) chatNode.at("/response/localizationCodes");
            message += formMessageForCodes(localizationCodes, locale);

            if(chatNode.get("response").has("text")) {
                message += chatNode.at("/response/text").asText();
            }

            ((ObjectNode) chatNode.get("response")).put("text", message);
        }

        return chatNode;
    }

    public String formMessageForCodes(ArrayNode localizationCodes, String locale) {
        List<String> localizedMessages = localizationService.getMessagesForCodes(localizationCodes, locale);

        StringBuilder message = new StringBuilder();
        localizedMessages.stream().forEach(localizedMessage -> message.append(localizedMessage));

        return message.toString();
    }

}
