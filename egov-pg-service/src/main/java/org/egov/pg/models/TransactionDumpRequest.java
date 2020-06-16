package org.egov.pg.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@AllArgsConstructor
@Getter
@ToString
@NoArgsConstructor
public class TransactionDumpRequest {

    @JsonProperty("RequestInfo")
    private org.egov.common.contract.request.RequestInfo requestInfo;

    @JsonProperty("TransactionDump")
    private TransactionDump transactionDump;
}
