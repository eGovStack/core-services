package org.egov.pg.models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.egov.pg.web.models.ResponseInfo;

import java.util.List;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class IdGenerationResponse {

    private ResponseInfo responseInfo;

    private List<IdResponse> idResponses;

}
