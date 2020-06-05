package org.egov;


import org.cache2k.extra.spring.SpringCache2kCacheManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.web.client.RestTemplate;

import java.util.concurrent.TimeUnit;

@SpringBootApplication
@Configuration
@EnableCaching
@PropertySource("classpath:application.properties")
public class IndexerInfraApplication {
    @Autowired
    private Environment env;

	@Value("${cache.expiry.mdms.masters.minutes}")
	private int mdmsMasterExpiry;
	
	public static void main(String[] args) {
		SpringApplication.run(IndexerInfraApplication.class, args);
	}    

	@Bean
	public RestTemplate restTemplate() {
	    return new RestTemplate();
	}

//	@Bean
//	public ObjectMapper objectMapper() {
//		ObjectMapper mapper = new ObjectMapper(new YAMLFactory());
//		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
//		mapper.configure(MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES, true);
//		mapper.setSerializationInclusion(Include.NON_NULL);
//		mapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
//		mapper.getFactory().configure(JsonGenerator.Feature.ESCAPE_NON_ASCII, true);
//		return mapper;
//	}

	@Bean
	@Profile("!test")
	public CacheManager cacheManager() {
		return new SpringCache2kCacheManager()
				.addCaches(b->b.name("masterData")
						.expireAfterWrite(mdmsMasterExpiry, TimeUnit.MINUTES));
	}
	
	
}
