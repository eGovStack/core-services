package org.egov.url.shortening.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Setter
@Getter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class ShortenRequest {
	
	private String id;
	private String url;
	private Long validFrom;
	private Long validTill;
	private String createdBy;
	private String modifiedBy;
	private String createdTime;
	private String modifiedTime;
	
}
