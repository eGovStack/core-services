package org.egov.web.notification.sms;

import javax.annotation.PostConstruct;

import org.egov.tracer.config.TracerConfiguration;
import org.egov.web.notification.sms.models.Sms;
import org.egov.web.notification.sms.service.SMSService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ExitCodeGenerator;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@SpringBootApplication
@Import(TracerConfiguration.class)
@Slf4j
@EnableKafka
public class EgovNotificationSmsApplication {

    @Autowired
    private ApplicationContext context;

    @Autowired
    private Environment environment;

    
    public static void main(String[] args) {
        SpringApplication.run(EgovNotificationSmsApplication.class, args);
    }
    
    @PostConstruct
    private void init() {
        if (StringUtils.isEmpty(environment.getProperty("sms.provider.class"))) {
            log.error("The provider gateway has not been configured. Please configure sms.provider.class");
            int exitCode = SpringApplication.exit(context, (ExitCodeGenerator) () -> 1);
            System.exit(exitCode);
        }
    }

    @Primary
    @Bean
    public RestTemplate getRestTemplate() {
        return new RestTemplate();
    }
    
    @Bean
    public ObjectMapper objectMapper(){
        return new ObjectMapper()
                .configure(MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES, true)
                .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
    }
}
