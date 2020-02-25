package org.egov.chat.post.controller;

import com.fasterxml.jackson.databind.JsonNode;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.egov.chat.post.localization.LocalizationStream;
import org.egov.chat.util.KafkaTopicCreater;
import org.egov.chat.xternal.Responseformatter.ValueFirst.ValueFirstResponseFormatter;
import org.egov.chat.xternal.Responseformatter.ValueFirst.ValueFirstRestCall;
import org.egov.chat.xternal.systeminitiated.PGRStatusUpdateEventFormatter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Controller;

import javax.annotation.PostConstruct;

//import org.egov.chat.xternal.systeminitiated.WaterSewerageEventFormatter;

@Controller
public class PostChatController {
    //
//    @Autowired
//    private WaterSewerageEventFormatter waterSewerageEventFormatter;
    @Autowired
    private PGRStatusUpdateEventFormatter pgrStatusUpdateEventFormatter;
    @Autowired
    private KafkaTopicCreater kafkaTopicCreater;
    @Autowired
    private LocalizationStream localizationStream;
    // @Autowired
    // private KarixResponseFormatter karixResponseFormatter;
    // @Autowired
    // private KarixRestCall karixRestCall;
    @Autowired
    private ValueFirstResponseFormatter valueFirstResponseFormatter;
    @Autowired
    private ValueFirstRestCall valueFirstRestCall;


    @PostConstruct
    public void init() {
//        waterSewerageEventFormatter.startStream("water-sewerage-received-messages", "send-message");
        // pgrStatusUpdateEventFormatter.startStream("update-pgr-service", "send-message-localized");

        kafkaTopicCreater.createTopic("send-message");
        kafkaTopicCreater.createTopic("send-message-localized");
        kafkaTopicCreater.createTopic("valuefirst-send-message");

        localizationStream.startStream("send-message", "send-message-localized");
                // karixResponseFormatter.startResponseStream("send-message-localized", "karix-send-message");
        valueFirstResponseFormatter.startResponseStream("send-message-localized", "valuefirst-send-message");
    }

    // TODO : Move to kafka-connect-http-sink
    @KafkaListener(groupId = "valuefirst-rest-call", topics = "valuefirst-send-message")
    public void sendMessage(ConsumerRecord<String, JsonNode> consumerRecord) {
//        karixRestCall.sendMessage(consumerRecord.value());
        valueFirstRestCall.sendMessage(consumerRecord.value());
    }


}
