package org.egov.id.model;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.*;

/**
 * <h1>IdRequest</h1>
 * 
 * @author Narendra
 *
 */
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class IdRequest {

	@Size(max = 200)
	@JsonProperty("idName")
	@NotNull
	private String idName;

	@NotNull
	@Size(max=200)
	@JsonProperty("tenantId")
	private String tenantId;

	@Size(max = 200)
	@JsonProperty("format")
	private String format;

	@JsonProperty("count")
	private Integer count;

}
