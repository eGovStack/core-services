package org.egov.web.notification.sms.consumer;

import lombok.extern.slf4j.Slf4j;
import org.egov.web.notification.sms.consumer.contract.SMSRequest;
import org.egov.web.notification.sms.models.RequestContext;
import org.egov.web.notification.sms.service.SMSService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;

import java.util.UUID;

@Slf4j
@Service
public class SmsNotificationListener {

    private SMSService smsService;

    @Autowired
    public SmsNotificationListener(SMSService smsService) {
        this.smsService = smsService;
    }

    @KafkaListener(id = "${kafka.topics.notification.sms.id}",
            topics = "${kafka.topics.notification.sms.name}",
            group = "${kafka.topics.notification.sms.group}")
    public void process(SMSRequest request) {
        RequestContext.setId(UUID.randomUUID().toString());
        //
        try {
            smsService.sendSMS(request.toDomain());
        } catch (RestClientException Rx ) {
            //go to backup
            log.info("Going to backup SMS Service");

        } catch (Exception ex) {
            log.error("Sms service failed", ex);
        }
    }

}

