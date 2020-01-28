package org.egov.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import org.egov.domain.exception.InvalidTokenValidateRequestException;

import static org.springframework.util.StringUtils.isEmpty;

@AllArgsConstructor
@Builder
@EqualsAndHashCode
@Getter
@Setter
@ToString
public class ValidateRequest {
    private String tenantId;
    private String otp;
    private String identity;

    public void validate() {
        if (isTenantIdAbsent() || isOtpAbsent() || isIdentityAbsent()) {
            throw new InvalidTokenValidateRequestException(this);
        }
    }

    public boolean isIdentityAbsent() {
        return isEmpty(identity);
    }

    public boolean isOtpAbsent() {
        return isEmpty(otp);
    }

    public boolean isTenantIdAbsent() {
        return isEmpty(tenantId);
    }
}
