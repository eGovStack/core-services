package org.egov.infra.indexer.custom.pt;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

/**
 * Institution
 */

@ToString
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Institution {

	@JsonProperty("id")
	private String id;

	@JsonProperty("tenantId")
	private String tenantId;
	
	@JsonProperty("name")	
	private String name;

	@JsonProperty("type")
	private String type;

	@JsonProperty("designation")
	private String designation;

	@JsonProperty("nameOfAuthorizedPerson")
	private String nameOfAuthorizedPerson;

	@JsonProperty("additionalDetails")
	private Object additionalDetails;
}
