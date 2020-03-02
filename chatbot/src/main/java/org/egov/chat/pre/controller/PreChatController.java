package org.egov.chat.pre.controller;

import org.egov.chat.pre.service.PreChatbotStream;
import org.egov.chat.util.KafkaTopicCreater;
import org.egov.chat.xternal.Requestformatter.ValueFirst.ValueFirstRequestFormatter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;

import javax.annotation.PostConstruct;

@Controller
public class PreChatController {

    @Autowired
    private ValueFirstRequestFormatter valueFirstRequestFormatter;
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

        valueFirstRequestFormatter.startRequestFormatterStream("whatsapp-received-messages",
                "transformed-input-messages", "chatbot-error-messages");

        preChatbotStream.startPreChatbotStream("transformed-input-messages", "input-messages");
    }

}
