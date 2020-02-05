package org.egov.chat.pre.controller;

import org.egov.chat.pre.service.TenantIdEnricher;
import org.egov.chat.pre.service.UserDataEnricher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;

import javax.annotation.PostConstruct;

@Controller
public class PreChatController {
//
//    @Autowired
//    private KarixRequestFormatter karixRequestFormatter;
    @Autowired
    private TenantIdEnricher tenantIdEnricher;
    @Autowired
    private UserDataEnricher userDataEnricher;

    @PostConstruct
    public void initPreChatbotStreams() {
//        karixRequestFormatter.startRequestFormatterStream("whatsapp-received-messages",
//                "transformed-input-messages", "chatbot-error-messages");
        tenantIdEnricher.startTenantEnricherStream("transformed-input-messages", "tenant-enriched-messages");
        userDataEnricher.startUserDataStream("tenant-enriched-messages", "input-messages");
    }

}
