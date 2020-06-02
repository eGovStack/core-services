package org.egov.common.contract.response;

import com.fasterxml.jackson.annotation.*;
import lombok.*;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class CacheBustResponse {
	private ResponseInfo responseInfo;
	@JsonProperty("isSuccessful")
	private boolean isSuccessful;
}
