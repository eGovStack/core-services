package org.egov.wf;


import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.jayway.jsonpath.JsonPath;
import org.cache2k.extra.spring.SpringCache2kCacheManager;
import org.egov.tracer.config.TracerConfiguration;
import org.egov.wf.service.MDMSService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Profile;

import javax.annotation.PostConstruct;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;
import java.util.concurrent.TimeUnit;

@SpringBootApplication
@EnableCaching
@Import({ TracerConfiguration.class })
public class Main {

    public static final String MDMS_DATA_JSONPATH = "$.MdmsRes.Workflow.BusinessServiceMasterConfig";;

    @Value("${app.timezone}")
    private String timeZone;

    @Value("${cache.expiry.workflow.minutes}")
    private int workflowExpiry;

    @Autowired
    private MDMSService mdmsService;

    @Bean
    public ObjectMapper objectMapper(){
        return new ObjectMapper()
                .configure(MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES, true)
                .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
                .enable(DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY)
                .setTimeZone(TimeZone.getTimeZone(timeZone));
    }

    @Bean
    public Map<String,String> businessServicetoIsStateLevel()
    {
        Object object = mdmsService.mDMSCall();
        String string = object.toString();
        String jsonpath = MDMS_DATA_JSONPATH;
        List<Map<String,String>> list= JsonPath.read(string, jsonpath);
        Map<String,String> businessServicetoStateLevel = new HashMap<>();
        for(Map<String,String> map:list)
        {
            String key = map.get("businessService");
            String value = map.get("isStatelevel");
            businessServicetoStateLevel.put(key,value);
        }
        return businessServicetoStateLevel;
    }

    public static void main(String[] args) throws Exception {
        SpringApplication.run(Main.class, args);
    }

    @Bean
    @Profile("!test")
    public CacheManager cacheManager(){
        return new SpringCache2kCacheManager().addCaches(b->b.name("businessService").expireAfterWrite(workflowExpiry, TimeUnit.MINUTES).entryCapacity(10));
    }

}
