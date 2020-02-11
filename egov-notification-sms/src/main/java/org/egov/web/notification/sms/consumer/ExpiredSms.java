package org.egov.web.notification.sms.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.egov.tracer.kafka.CustomKafkaTemplate;
import org.egov.web.notification.sms.consumer.contract.SMSRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;


@Slf4j
@Component
public class ExpiredSms {

    private CustomKafkaTemplate<String, SMSRequest> kafkaTemplate;
    private String ExpirySmsTopic;

    public ExpiredSms(CustomKafkaTemplate<String, SMSRequest> kafkaTemplate,
                                   @Value("${kafka.topics.Expiry.sms}") String BackupSmsTopic) {
        this.kafkaTemplate = kafkaTemplate;
        this.ExpirySmsTopic = BackupSmsTopic;
    }

    public void sendToExpiryTopic(SMSRequest request) {
        log.info("queueing on topic" + ExpirySmsTopic);
        kafkaTemplate.send(ExpirySmsTopic, request);
    }

}
