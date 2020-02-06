package org.egov.chat.controller;

import org.egov.chat.service.InitiateConversation;
import org.egov.chat.service.ResetCheck;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class StreamController {

    @Autowired
    private InitiateConversation initiateConversation;
    @Autowired
    private ResetCheck resetCheck;

    public void generateStreams() {
//        initiateConversation.startStream("input-messages", "input-reset-check");
//
//        resetCheck.startStream("input-reset-check", "input-answer", "answer-reset");

        resetCheck.startStream("input-messages", "input-reset-check");

        initiateConversation.startStream("input-reset-check", "input-answer");
    }

}
