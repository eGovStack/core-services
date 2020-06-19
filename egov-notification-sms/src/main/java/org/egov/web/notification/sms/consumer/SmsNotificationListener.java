package org.egov.web.notification.sms.consumer;

import java.util.UUID;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.egov.web.notification.sms.consumer.contract.SMSRequest;
import org.egov.web.notification.sms.models.Category;
import org.egov.web.notification.sms.models.RequestContext;
import org.egov.web.notification.sms.service.SMSService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import java.util.HashMap;

@Slf4j
@Service
public class SmsNotificationListener {

    private SMSService smsService;
    private BackupSMSServiceListner backupSMSService;
    private ExpiredSms expiredSms;
    private SmsErrorListener smsErrorListener;

    @Autowired
    private ObjectMapper objectMapper;


    @Autowired
    public SmsNotificationListener(SMSService smsService, BackupSMSServiceListner backupSMSService, ExpiredSms expiredSms, SmsErrorListener smsErrorListener) {
        this.smsService = smsService;
        this.backupSMSService = backupSMSService;
        this.expiredSms = expiredSms;
        this.smsErrorListener = smsErrorListener;
    }

    @KafkaListener(id = "${kafka.topics.notification.sms.id}",
            topics = "${kafka.topics.notification.sms.name}",
            groupId = "${kafka.topics.notification.sms.group}")
    public void process(HashMap<String, Object> consumerRecord) {
        RequestContext.setId(UUID.randomUUID().toString());
        SMSRequest request = null;
        try {
            request = objectMapper.convertValue(consumerRecord, SMSRequest.class);
            if (request.getExpiryTime() != null && request.getCategory() == Category.OTP) {
                Long expiryTime = request.getExpiryTime();
                Long currentTime = System.currentTimeMillis();
                if (expiryTime < currentTime) {
                    log.info("OTP Expired");
                    expiredSms.sendToExpiryTopic(request);
                } else {
                    smsService.sendSMS(request.toDomain());
                }
            } else {
                smsService.sendSMS(request.toDomain());
            }
        } catch (RestClientException Rx) {
            log.info("Going to backup SMS Service", Rx);
            backupSMSService.sendToBackup(request);
        } catch (Exception ex) {
            log.error("Sms service failed", ex);
            smsErrorListener.sendToErrorQueue(request);
        }

    }
}

