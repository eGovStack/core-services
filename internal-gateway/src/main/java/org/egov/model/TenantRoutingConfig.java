package org.egov.model;

import java.util.Map;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Setter
@Getter
@ToString
public class TenantRoutingConfig {

	private String incomingURI;	
	private Map<String, String> tenantRoutingMap;
}
