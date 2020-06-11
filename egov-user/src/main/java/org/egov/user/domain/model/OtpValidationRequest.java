package org.egov.user.domain.model;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@EqualsAndHashCode
public class OtpValidationRequest {
	private String otpReference;
	private String mobileNumber;
	protected String tenantId;
}
