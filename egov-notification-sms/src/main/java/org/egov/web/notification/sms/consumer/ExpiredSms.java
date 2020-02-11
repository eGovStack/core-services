package org.egov.web.notification.sms.consumer;

import lombok.extern.slf4j.Slf4j;
import org.egov.tracer.kafka.CustomKafkaTemplate;
import org.egov.web.notification.sms.consumer.contract.SMSRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;


@Slf4j
@Component
public class ExpiredSms {

    private CustomKafkaTemplate<String, SMSRequest> kafkaTemplate;
    private String ExpirySmsTopic;

    public ExpiredSms(CustomKafkaTemplate<String, SMSRequest> kafkaTemplate,
                      @Value("${kafka.topics.expiry.sms}") String ExpiredSmsTopic) {
        this.kafkaTemplate = kafkaTemplate;
        this.ExpirySmsTopic = ExpiredSmsTopic;
    }

    public void sendToExpiryTopic(SMSRequest request) {
        log.info("queueing on topic" + ExpirySmsTopic);
        kafkaTemplate.send(ExpirySmsTopic, request);
    }

}
