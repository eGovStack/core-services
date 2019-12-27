package org.egov.chat.post.controller;

import com.fasterxml.jackson.databind.JsonNode;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.egov.chat.post.formatter.karix.KarixResponseFormatter;
import org.egov.chat.post.formatter.karix.KarixRestCall;
import org.egov.chat.post.localization.LocalizationStream;
import org.egov.chat.post.systeminitiated.pgr.PGRStatusUpdateEventFormatter;
import org.egov.chat.post.systeminitiated.water.WaterSewerageEventFormatter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Controller;

import javax.annotation.PostConstruct;

@Controller
public class PostChatController {

    @Autowired
    private WaterSewerageEventFormatter waterSewerageEventFormatter;
    @Autowired
    private PGRStatusUpdateEventFormatter pgrStatusUpdateEventFormatter;

    @Autowired
    private LocalizationStream localizationStream;
    @Autowired
    private KarixResponseFormatter karixResponseFormatter;
    @Autowired
    private KarixRestCall karixRestCall;


    @PostConstruct
    public void init() {
        waterSewerageEventFormatter.startStream("water-sewerage-received-messages", "send-message");
        pgrStatusUpdateEventFormatter.startStream("update-pgr-service", "send-message");

        localizationStream.startStream("send-message", "send-message-localized");
        karixResponseFormatter.startResponseStream("send-message-localized", "karix-send-message");
    }

    // TODO : Move to kafka-connect-http-sink
    @KafkaListener(groupId = "karix-rest-call", topics = "karix-send-message")
    public void sendMessage(ConsumerRecord<String, JsonNode> consumerRecord) {
        karixRestCall.sendMessage(consumerRecord.value());
    }


}
