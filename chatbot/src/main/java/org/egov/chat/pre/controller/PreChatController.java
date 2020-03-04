package org.egov.chat.pre.controller;

import com.fasterxml.jackson.databind.JsonNode;
import org.egov.chat.pre.service.MessageWebhook;
import org.egov.chat.pre.service.PreChatbotStream;
import org.egov.chat.util.KafkaTopicCreater;
import org.egov.chat.xternal.requestformatter.ValueFirst.ValueFirstRequestFormatter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.annotation.PostConstruct;

@RestController
public class PreChatController {

    @Autowired
    private MessageWebhook messageWebhook;
    @Autowired
    private PreChatbotStream preChatbotStream;
    @Autowired
    private KafkaTopicCreater kafkaTopicCreater;

    @PostConstruct
    public void initPreChatbotStreams() {
        kafkaTopicCreater.createTopic("whatsapp-received-messages");
        kafkaTopicCreater.createTopic("transformed-input-messages");
        kafkaTopicCreater.createTopic("chatbot-error-messages");
        kafkaTopicCreater.createTopic("input-messages");

        preChatbotStream.startPreChatbotStream("transformed-input-messages", "input-messages");
    }

    @RequestMapping(value="/messages", method = RequestMethod.POST)
    public ResponseEntity<Object> receiveMessage(@RequestBody JsonNode message) throws Exception {
        return new ResponseEntity<>(messageWebhook.receiveMessage(message), HttpStatus.OK );
    }

}
