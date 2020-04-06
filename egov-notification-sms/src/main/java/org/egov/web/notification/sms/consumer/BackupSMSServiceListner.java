package org.egov.web.notification.sms.consumer;

import lombok.extern.slf4j.Slf4j;
import org.egov.tracer.kafka.CustomKafkaTemplate;
import org.egov.web.notification.sms.consumer.contract.SMSRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;


@Slf4j
@Component
public class BackupSMSServiceListner {

    private CustomKafkaTemplate<String, SMSRequest> kafkaTemplate;
    private String BackupSmsTopic;

    public BackupSMSServiceListner(CustomKafkaTemplate<String, SMSRequest> kafkaTemplate,
                                   @Value("${kafka.topics.backup.sms}") String BackupSmsTopic) {
        this.kafkaTemplate = kafkaTemplate;
        this.BackupSmsTopic = BackupSmsTopic;
    }

    public void sendToBackup(SMSRequest request) {
        log.info("queueing on topic" + BackupSmsTopic);
        kafkaTemplate.send(BackupSmsTopic, request);
    }

}
