package org.egov.common.contract.response;

import com.fasterxml.jackson.annotation.*;
import lombok.*;

import java.util.*;

@AllArgsConstructor
@Getter
public class UserSearchResponse {
    @JsonProperty("responseInfo")
    ResponseInfo responseInfo;

    @JsonProperty("user")
    List<UserSearchResponseContent> userSearchResponseContent;
}
