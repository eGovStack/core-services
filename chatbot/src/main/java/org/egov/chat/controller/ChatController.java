package org.egov.chat.controller;

import com.fasterxml.jackson.databind.JsonNode;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.egov.chat.service.InitiateConversation;
import org.egov.chat.service.InputSegregator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Controller;

import javax.annotation.PostConstruct;
import java.io.IOException;

@Controller
public class ChatController {

    @Autowired
    private GraphStreamGenerator graphStreamGenerator;
    @Autowired
    private StreamController streamController;

    @Autowired
    private InputSegregator inputSegregator;

    @PostConstruct
    public void init() throws IOException {
        streamController.generateStreams();
        graphStreamGenerator.generateGraphStreams();
    }

    @KafkaListener(groupId = "input-segregator", topics = "input-answer")
    public void segregateInput(ConsumerRecord<String, JsonNode> consumerRecord) {
        inputSegregator.segregateAnswer(consumerRecord);
    }

}
