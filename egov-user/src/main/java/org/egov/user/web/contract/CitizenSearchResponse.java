package org.egov.user.web.contract;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import org.egov.common.contract.response.ResponseInfo;
import org.egov.user.domain.model.Citizen;

import java.util.List;

@Data
@Builder
public class CitizenSearchResponse {

    @JsonProperty("responseInfo")
    ResponseInfo responseInfo;

    @JsonProperty("user")
    List<Citizen> citizens;

}
