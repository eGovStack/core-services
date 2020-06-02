package org.egov.common.client;

import lombok.*;
import org.egov.common.config.*;
import org.egov.common.contract.request.*;
import org.egov.common.contract.response.*;
import org.egov.common.exceptions.*;

import java.net.*;
import java.util.*;

public class UserService {
    private static final String userHost;
    private static final String userContext;

    static {
        userHost = HostConfigs.getUserHost();
        userContext = HostConfigs.getUserContext();
    }

    @SneakyThrows
    public static URI getUrl(String url) {
        return HttpService.resolveUrl(userHost, userContext, url);
    }

    public static UserDetailResponse createCitizen(CreateUserRequest createUserRequest, HashMap<String, String> queryParams) throws HttpClientException {
        return HttpService.getInstance().post(getUrl("/citizen/_create"), createUserRequest, queryParams);
    }


    public static UserDetailResponse createUserWithoutValidation(CreateUserRequest createUserRequest, HashMap<String, String> queryParams) throws HttpClientException {
        return HttpService.getInstance().post(getUrl("/users/_createnovalidate"), createUserRequest, queryParams);
    }

    public static UserSearchResponse searchUser(UserSearchRequest searchUser, HashMap<String, String> queryParams) throws HttpClientException {
        return HttpService.getInstance().post(getUrl("/_search"), searchUser, queryParams);
    }

    public static CustomUserDetails getUseDetails(UserDetailsQueryParam queryParams) throws HttpClientException {
        return HttpService.getInstance().post(getUrl("/_details"), null, queryParams);
    }

    public static UserDetailResponse updateUserWithoutValidation(CreateUserRequest createUserRequest, HashMap<String, String> queryParams) throws HttpClientException {
        return HttpService.getInstance().post(getUrl("/users/_updatenovalidate"), createUserRequest, queryParams);
    }

    public static UserDetailResponse profileUpdate(CreateUserRequest createUserRequest, HashMap<String, String> queryParams) throws HttpClientException {
        return HttpService.getInstance().post(getUrl("/profile/_update"), createUserRequest, queryParams);
    }

}
