package org.egov.domain.model;

import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;

import java.util.Set;

import static org.apache.commons.lang3.StringUtils.isEmpty;

@Getter
@Builder
@EqualsAndHashCode
public class MessageSearchCriteria {
	private Tenant tenantId;
	private String locale;
	private String module;
	private Set<String> codes;

	public boolean isModuleAbsent() {
		return isEmpty(module);
	}
}
