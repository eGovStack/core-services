package org.egov.infra.indexer.custom.pt;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

/**
 * GeoLocation
 */

@ToString
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GeoLocation   {
	
  @JsonProperty("latitude")
  private Double latitude;

  @JsonProperty("longitude")
  private Double longitude;

  }
