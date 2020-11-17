package org.egov.user;

import io.opentracing.noop.*;
import org.egov.tracer.config.*;
import org.springframework.context.annotation.*;
import org.springframework.kafka.core.KafkaTemplate;

import static org.mockito.Mockito.mock;
 import io.jaegertracing.internal.JaegerTracer;

import javax.annotation.*;

@Configuration
public class TestConfiguration {

    @Bean
    @SuppressWarnings("unchecked")
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return mock(KafkaTemplate.class);
    }

    @Bean
    public io.opentracing.Tracer tracer() {
        return NoopTracerFactory.create();
    }
}
