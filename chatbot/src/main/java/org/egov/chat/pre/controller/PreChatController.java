package org.egov.chat.pre.controller;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.egov.chat.pre.service.MessageWebhook;
import org.egov.chat.pre.service.PreChatbotStream;
import org.egov.chat.util.KafkaTopicCreater;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
public class PreChatController {

    @Autowired
    private MessageWebhook messageWebhook;
    @Autowired
    private PreChatbotStream preChatbotStream;
    @Autowired
    private KafkaTopicCreater kafkaTopicCreater;

    @Value("${topic.name.prefix}")
    private String topicNamePrefix;

    private String transformedInputMessages = "transformed-input-messages";
    private String chatbotErrorMessages = "chatbot-error-messages";
    private String inputMessages = "input-messages";

    @PostConstruct
    public void initPreChatbotStreams() {
        kafkaTopicCreater.createTopic(topicNamePrefix + transformedInputMessages);
        kafkaTopicCreater.createTopic(topicNamePrefix + chatbotErrorMessages);
        kafkaTopicCreater.createTopic(topicNamePrefix + inputMessages);

        preChatbotStream.startPreChatbotStream(topicNamePrefix + transformedInputMessages,
                topicNamePrefix + inputMessages);
    }

    @RequestMapping(value = "/messages", method = RequestMethod.POST)
    public ResponseEntity<Object> receiveMessage(
            @RequestParam Map<String, String> params) throws Exception {
        return new ResponseEntity<>(messageWebhook.receiveMessage(params), HttpStatus.OK);
    }

    @RequestMapping(value = "/messages", method = RequestMethod.GET)
    public ResponseEntity<Object> getMessage(@RequestParam Map<String, String> queryParams) throws Exception {
        return new ResponseEntity<>(messageWebhook.receiveMessage(queryParams), HttpStatus.OK );
    }

}
