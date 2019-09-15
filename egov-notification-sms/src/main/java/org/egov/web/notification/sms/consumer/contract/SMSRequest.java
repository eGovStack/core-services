package org.egov.web.notification.sms.consumer.contract;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import org.egov.web.notification.sms.models.Priority;
import org.egov.web.notification.sms.models.Sms;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class SMSRequest {
    private String mobileNumber;
    private String message;
    private Priority priority;

    public Sms toDomain() {
        return new Sms(mobileNumber, message, priority);
    }
}
