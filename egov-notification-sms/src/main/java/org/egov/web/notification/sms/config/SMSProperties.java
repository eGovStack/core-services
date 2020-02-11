package org.egov.web.notification.sms.config;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
@Data
public class SMSProperties {

    @Value("${sms.provider.url}")
    public String url;

    @Value("${sms.sender.username}")
    public String username;

    @Value("${sms.sender.password}")
    public String password;

    @Value("${sms.sender}")
    public String senderid;

    @Value("${sms.sender.secure.key}")
    public String secureKey;

    @Value("#{${sms.config.map}}")
    Map<String, String> configMap;

}
