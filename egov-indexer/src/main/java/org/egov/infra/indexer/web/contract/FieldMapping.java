package org.egov.infra.indexer.web.contract;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class FieldMapping {
	
	  @JsonProperty("inJsonPath")
	  private String injsonpath;

	  @JsonProperty("outJsonPath")
	  private String outJsonPath;
	  
	  @JsonProperty("filter")
	  private String filter;

	  @JsonProperty("filterMapping")
	  private List<FilterMapping> filterMapping;

}
