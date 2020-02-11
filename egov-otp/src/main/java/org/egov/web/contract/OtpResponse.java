package org.egov.web.contract;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.egov.common.contract.response.ResponseInfo;
import org.egov.domain.model.Token;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Setter
public class OtpResponse {
	private ResponseInfo responseInfo;
    private Otp otp;

    public OtpResponse(Token token) {
        if (token != null) {
            otp = new Otp(token);
        }
    }
}


