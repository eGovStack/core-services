package org.egov.web.notification.sms.consumer;

import java.util.UUID;

import org.egov.web.notification.sms.consumer.contract.SMSRequest;
import org.egov.web.notification.sms.models.RequestContext;
import org.egov.web.notification.sms.service.SMSService;
import org.springframework.beans.factory.annotation.Autowired;
import org.egov.web.notification.sms.service.SMSService;
import org.springframework.beans.factory.annotation.*;
import org.springframework.context.ApplicationContext;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class SmsNotificationListener {

    private SMSService smsService;

    @Autowired
    public SmsNotificationListener(ApplicationContext context,
                                   @Value("${sms.service.class}")String smsServiceClass) {
        this.smsService = (SMSService) context.getBean(smsServiceClass);
    }

    @KafkaListener(id = "${kafka.topics.notification.sms.id}",
            topics = "${kafka.topics.notification.sms.name}",
            group = "${kafka.topics.notification.sms.group}")
    public void process(SMSRequest request) {
        RequestContext.setId(UUID.randomUUID().toString());
        smsService.sendSMS(request.toDomain());
    }

}

