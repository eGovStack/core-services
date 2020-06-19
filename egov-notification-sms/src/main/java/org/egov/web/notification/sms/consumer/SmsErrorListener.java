package org.egov.web.notification.sms.consumer;

import lombok.extern.slf4j.Slf4j;
import org.egov.tracer.kafka.CustomKafkaTemplate;
import org.egov.web.notification.sms.consumer.contract.SMSRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;


@Slf4j
@Component
public class SmsErrorListener {
    private CustomKafkaTemplate<String, SMSRequest> kafkaTemplate;
    private String ErrorSmsTopic;

    public SmsErrorListener(CustomKafkaTemplate<String, SMSRequest> kafkaTemplate,
                            @Value("${kafka.topics.error.sms}") String ErrorSmsTopic) {
        this.kafkaTemplate = kafkaTemplate;
        this.ErrorSmsTopic = ErrorSmsTopic;
    }

    public void sendToErrorQueue(SMSRequest request) {
        log.info("queueing on topic" + ErrorSmsTopic);
        kafkaTemplate.send(ErrorSmsTopic, request);
    }
}
