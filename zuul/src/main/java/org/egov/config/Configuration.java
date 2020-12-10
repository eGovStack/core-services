package org.egov.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.http.client.BufferingClientHttpRequestFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import org.egov.exceptions.CustomException;
import org.springframework.http.HttpStatus;
import com.marcosbarbero.cloud.autoconfigure.zuul.ratelimit.config.repository.DefaultRateLimiterErrorHandler;
import com.marcosbarbero.cloud.autoconfigure.zuul.ratelimit.config.repository.RateLimiterErrorHandler;

@org.springframework.context.annotation.Configuration
public class Configuration {


    @Bean
    public RestTemplate restTemplate() {
        return  new RestTemplate(new BufferingClientHttpRequestFactory(new SimpleClientHttpRequestFactory()));
    }

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper().disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
    }

    @Bean
    public RateLimiterErrorHandler rateLimitErrorHandler() {
      return new DefaultRateLimiterErrorHandler() {
          @Override
          public void handleSaveError(String key, Exception e) {
              throw new RuntimeException( new CustomException("TOO_MANY_REQUESTS", HttpStatus.TOO_MANY_REQUESTS.value() ,"Too many requests"));
          }

          @Override
          public void handleFetchError(String key, Exception e) {
        	  throw new RuntimeException( new CustomException("TOO_MANY_REQUESTS", HttpStatus.TOO_MANY_REQUESTS.value() ,"Too many requests"));
          }

          @Override
          public void handleError(String msg, Exception e) {
        	  throw new RuntimeException( new CustomException("TOO_MANY_REQUESTS", HttpStatus.TOO_MANY_REQUESTS.value() ,"Too many requests"));
          }
      };
    }
    

}
