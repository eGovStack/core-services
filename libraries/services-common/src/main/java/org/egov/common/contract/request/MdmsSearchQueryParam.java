package org.egov.common.contract.request;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
@EqualsAndHashCode
public class MdmsSearchQueryParam {
    String moduleName;
    String masterName;
    String filter;
    String tenantId;
}
