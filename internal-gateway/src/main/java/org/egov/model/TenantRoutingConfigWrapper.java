package org.egov.model;

import java.util.List;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Setter
@Getter
@ToString
public class TenantRoutingConfigWrapper {

	private List<TenantRoutingConfig> tenantRoutingConfig;
}
