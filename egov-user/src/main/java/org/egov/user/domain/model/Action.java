package org.egov.user.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Action {
	private String name;
	private String url;
	private String displayName;
	private Integer orderNumber;
	private String queryParams;
	private String parentModule;
	private String serviceCode;
}

