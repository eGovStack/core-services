package org.egov.common.contract.response;

import com.fasterxml.jackson.annotation.*;
import lombok.*;
import org.egov.common.contract.model.*;

import java.util.*;

@AllArgsConstructor
@Getter
public class UserDetailResponse {
    @JsonProperty("responseInfo")
    ResponseInfo responseInfo;

    @JsonProperty("user")
    List<UserRequest> user;
}
