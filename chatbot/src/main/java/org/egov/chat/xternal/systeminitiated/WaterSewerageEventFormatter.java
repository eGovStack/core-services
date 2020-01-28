package org.egov.chat.xternal.systeminitiated;

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
import org.egov.chat.post.systeminitiated.SystemInitiatedEventFormatter;
import org.egov.chat.util.FileStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Properties;

@Slf4j
@Component
public class WaterSewerageEventFormatter implements SystemInitiatedEventFormatter {

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private FileStore fileStore;
    @Autowired
    private KafkaStreamsConfig kafkaStreamsConfig;

    @Override
    public String getStreamName() {
        return "water-sewerage-formatter";
    }

    @Override
    public void startStream(String inputTopic, String outputTopic) {
        Properties streamConfiguration = kafkaStreamsConfig.getDefaultStreamConfiguration();
        streamConfiguration.put(StreamsConfig.APPLICATION_ID_CONFIG, getStreamName());
        StreamsBuilder builder = new StreamsBuilder();
        KStream<String, JsonNode> messagesKStream = builder.stream(inputTopic, Consumed.with(Serdes.String(),
                kafkaStreamsConfig.getJsonSerde()));

        messagesKStream.flatMapValues(event -> {
            try {
                return createChatNodes(event);
            } catch (Exception e) {
                log.error(e.getMessage());
                return Collections.emptyList();
            }
        }).to(outputTopic, Produced.with(Serdes.String(), kafkaStreamsConfig.getJsonSerde()));

        kafkaStreamsConfig.startStream(builder, streamConfiguration);
    }

    @Override
    public List<JsonNode> createChatNodes(JsonNode event) {

        String message = event.at("/body/message").asText();
        String tenantId = event.at("/body/tenantId").asText();
        String mobileNumber = event.at("/body/mobileNumber").asText();

        ObjectNode chatNode = objectMapper.createObjectNode();
        chatNode.put("tenantId", tenantId);

        ObjectNode responseMessage = objectMapper.createObjectNode();

        if(containsAttachment(event)) {
            responseMessage.put("type", "attachment");
            responseMessage.set("attachment", createAttachmentNode(event));
        } else {
            responseMessage.put("type", "text");
        }
        responseMessage.put("text", message);
        chatNode.set("response", responseMessage);

        ObjectNode user = objectMapper.createObjectNode();
        user.put("mobileNumber", mobileNumber);
        chatNode.set("user", user);

        return Collections.singletonList(chatNode);
    }

    public boolean containsAttachment(JsonNode event) {
        if(event.get("body").has("attachmentLink"))
            return true;
        return false;
    }

    public JsonNode createAttachmentNode(JsonNode event) {
        ObjectNode attachmentNode = objectMapper.createObjectNode();

        String attachmentLink = event.at("/body/attachmentLink").asText();
        String fileStoreId;
        if(event.get("body").has("filename")) {
            String filename = event.at("/body/filename").asText();
            fileStoreId = fileStore.downloadAndStore(attachmentLink, filename);
        } else {
            fileStoreId = fileStore.downloadAndStore(attachmentLink);
        }

        attachmentNode.put("fileStoreId", fileStoreId);

        log.debug(attachmentNode.toString());

        return attachmentNode;
    }

}
