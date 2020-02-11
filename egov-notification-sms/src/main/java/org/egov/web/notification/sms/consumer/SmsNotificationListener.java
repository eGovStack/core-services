package org.egov.web.notification.sms.consumer;

import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.egov.web.notification.sms.consumer.contract.SMSRequest;
import org.egov.web.notification.sms.models.Category;
import org.egov.web.notification.sms.models.RequestContext;
import org.egov.web.notification.sms.service.SMSService;
import org.egov.web.notification.sms.consumer.BackupSMSServiceListner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
public class SmsNotificationListener {

    private SMSService smsService;
    private BackupSMSServiceListner backupSMSService;
    private ExpiredSms expiredSms;

    @Autowired
    private ObjectMapper objectMapper;


    @Autowired
    public SmsNotificationListener(SMSService smsService, BackupSMSServiceListner backupSMSService, ExpiredSms expiredSms) {
        this.smsService = smsService;
        this.backupSMSService = backupSMSService;
        this.expiredSms = expiredSms;
    }

    @KafkaListener(id = "${kafka.topics.notification.sms.id}",
            topics = "${kafka.topics.notification.sms.name}",
            group = "${kafka.topics.notification.sms.group}")
    public void process(HashMap<String, Object> consumerRecord){
        RequestContext.setId(UUID.randomUUID().toString());
        SMSRequest request=null;
         try {
             request =objectMapper.convertValue(consumerRecord,SMSRequest.class);
             Long expiryTime = request.getExpiryTime();
             Long currentTime = System.currentTimeMillis();
             if(expiryTime<currentTime){
                 //write to kafka for expired OTP
                 log.info("OTP Expired");
                 expiredSms.sendToExpiryTopic(request);
             }else{
                 smsService.sendSMS(request.toDomain());
             }
        } catch (Exception Rx ) {
             //go to backup
             backupSMSService.sendToBackup(request);
             log.info("Going to backup SMS Service");
         }
//        } catch (Exception ex) {
//            log.error("Sms service failed", ex);
//        }

    }
}

