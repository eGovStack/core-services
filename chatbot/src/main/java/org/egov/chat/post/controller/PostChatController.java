package org.egov.chat.post.controller;

import com.fasterxml.jackson.databind.JsonNode;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.egov.chat.post.localization.LocalizationStream;
import org.egov.chat.util.KafkaTopicCreater;
import org.egov.chat.xternal.responseformatter.ValueFirst.ValueFirstResponseFormatter;
import org.egov.chat.xternal.responseformatter.ValueFirst.ValueFirstRestCall;
import org.egov.chat.xternal.systeminitiated.PGRStatusUpdateEventFormatter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Controller;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.List;

@Controller
public class PostChatController {
    @Autowired
    private PGRStatusUpdateEventFormatter pgrStatusUpdateEventFormatter;
    @Autowired
    private KafkaTopicCreater kafkaTopicCreater;
    @Autowired
    private LocalizationStream localizationStream;
    @Autowired
    private ValueFirstResponseFormatter valueFirstResponseFormatter;
    @Autowired
    private ValueFirstRestCall valueFirstRestCall;
    @Value("${update.pgr.service.topic}")
    private String updatePGRServiceTopic;

    @Value("${topic.name.prefix}")
    private String topicNamePrefix;

    private String sendMessage = "send-message";
    private String sendMessageLocalized = "send-message-localized";

    @PostConstruct
    public void init() {
//        pgrStatusUpdateEventFormatter.startStream(updatePGRServiceTopic, topicNamePrefix + sendMessageLocalized);
        kafkaTopicCreater.createTopic(topicNamePrefix + sendMessage);
        kafkaTopicCreater.createTopic(topicNamePrefix + sendMessageLocalized);
        localizationStream.startStream(topicNamePrefix + sendMessage, topicNamePrefix + sendMessageLocalized);
    }

    @KafkaListener(groupId = "${consumer.group.id.prefix}" + "valuefirst-rest-call",
            topics = "${topic.name.prefix}" + "send-message-localized")
    public void sendMessage(ConsumerRecord<String, JsonNode> consumerRecord) throws IOException {
        JsonNode jsonNode = consumerRecord.value();
        List<JsonNode> messages = valueFirstResponseFormatter.getTransformedResponse(jsonNode);
        for(JsonNode message : messages) {
            valueFirstRestCall.sendMessage(message);
        }
    }

}
