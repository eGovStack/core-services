package org.egov.common.contract.response;

import com.fasterxml.jackson.annotation.*;
import lombok.*;
import org.json.*;

import java.util.*;

@Setter
@Getter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MdmsResponse {

	@JsonProperty("ResponseInfo")
	private ResponseInfo responseInfo;
	
	@JsonProperty("MdmsRes")
	private Map<String, Map<String, JSONArray>> mdmsRes;
}
