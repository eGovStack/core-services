package org.egov.web.notification.sms.consumer.contract;

import org.egov.web.notification.sms.models.Category;
import org.egov.web.notification.sms.models.Sms;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class SMSRequest {
    private String mobileNumber;
    private String message;

    public Sms toDomain() {
        //Dhaval enum
        return new Sms(mobileNumber, message, Category.OTP);
    }
}
