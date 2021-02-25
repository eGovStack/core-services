package org.egov.model;

import java.util.Map;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Setter
@Getter
@ToString
public class TenantServiceMap {
	
	private Map<String, String> tenantRouterMap;
}
