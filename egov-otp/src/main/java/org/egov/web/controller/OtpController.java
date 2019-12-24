package org.egov.web.controller;

import javax.validation.Valid;

import org.egov.domain.model.Token;
import org.egov.domain.service.TokenService;
import org.egov.web.contract.OtpRequest;
import org.egov.web.contract.OtpResponse;
import org.egov.web.contract.OtpValidateRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
public class OtpController {

    private TokenService tokenService;

    public OtpController(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    @PostMapping("v1/_create")
    @ResponseStatus(HttpStatus.CREATED)
    public OtpResponse createOtp(@RequestBody @Valid OtpRequest otpRequest) {
        final Token token = tokenService.create(otpRequest.getTokenRequest());
        return new OtpResponse(token);
    }

    @PostMapping("v1/_validate")
    public OtpResponse validateOtp(@RequestBody @Valid OtpValidateRequest request) {
        final Token token = tokenService.validate(request.toDomainValidateRequest());
        return new OtpResponse(token);
    }

    @PostMapping("v1/_search")
    public OtpResponse search(@RequestBody OtpRequest request) {
        final Token token = tokenService.search(request.toSearchCriteria());
        return new OtpResponse(token);
    }
}

