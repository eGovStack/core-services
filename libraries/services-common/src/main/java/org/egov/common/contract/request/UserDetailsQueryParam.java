package org.egov.common.contract.request;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
@EqualsAndHashCode
public class UserDetailsQueryParam {
    String accessToken;
}
