package org.egov.utils;

import java.io.InputStreamReader;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.PostConstruct;

import org.egov.model.TenantRoutingConfig;
import org.egov.model.TenantRoutingConfigWrapper;
import org.egov.model.TenantServiceMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class RoutingConfig {

	@Value("${egov.service.config.path}")
	private String serviceConfigPath;

	private TenantRoutingConfigWrapper tenantRoutingConfigWrapper;

	@PostConstruct
	public void loadServiceConfigurationYaml() {
		System.out.println(" Translator Service ReadConfiguration");
		ObjectMapper mapper = new ObjectMapper();
		try {
			URL serviceConfigUrl = new URL(serviceConfigPath);
			tenantRoutingConfigWrapper = mapper.readValue(new InputStreamReader(serviceConfigUrl.openStream()),
					TenantRoutingConfigWrapper.class);

			for (TenantRoutingConfig tenantRoutingConfig : tenantRoutingConfigWrapper.getTenantRoutingConfig()) {
				boolean isUriContainRegex = tenantRoutingConfig.getIncomingURI().contains("*");
				if (isUriContainRegex) {
					String uriWithRegEx = tenantRoutingConfig.getIncomingURI().replace("*", "(.*)");
					tenantRoutingConfig.setIncomingURI(uriWithRegEx);
				}
			}
			log.info("loadYaml service: " + tenantRoutingConfigWrapper.toString());
		} catch (Exception e) {
			e.printStackTrace();
		}
		// return teanantRoutingConfig;
	}

	@Bean
	public TenantRoutingConfigWrapper geTeanantRoutingConfigWrapper() {
		return tenantRoutingConfigWrapper;
	}

}
