package org.egov.chat.pre.controller;

import org.egov.chat.pre.service.TenantIdEnricher;
import org.egov.chat.pre.service.UserDataEnricher;
import org.egov.chat.util.KafkaTopicCreater;
import org.egov.chat.xternal.Requestformatter.ValueFirst.ValueFirstRequestFormatter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;

import javax.annotation.PostConstruct;

@Controller
public class PreChatController {
//
    @Autowired
    private ValueFirstRequestFormatter valueFirstRequestFormatter;
    @Autowired
    private TenantIdEnricher tenantIdEnricher;
    @Autowired
    private UserDataEnricher userDataEnricher;
    @Autowired
    private KafkaTopicCreater kafkaTopicCreater;

    @PostConstruct
    public void initPreChatbotStreams() {
//        karixRequestFormatter.startRequestFormatterStream("whatsapp-received-messages",
//                "transformed-input-messages", "chatbot-error-messages");
        kafkaTopicCreater.createTopic("transformed-input-messages");
        kafkaTopicCreater.createTopic("chatbot-error-messages");
        kafkaTopicCreater.createTopic("tenant-enriched-messages");
        kafkaTopicCreater.createTopic("input-messages");
        kafkaTopicCreater.createTopic("whatsapp-received-messages");
        valueFirstRequestFormatter.startRequestFormatterStream("whatsapp-received-messages",
                "transformed-input-messages", "chatbot-error-messages");
        tenantIdEnricher.startTenantEnricherStream("transformed-input-messages", "tenant-enriched-messages");
        userDataEnricher.startUserDataStream("tenant-enriched-messages", "input-messages");
    }

}
