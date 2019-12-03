package org.egov.Utils;


import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.egov.contract.User;
import org.egov.model.UserDetailResponse;
import org.egov.model.UserSearchRequest;
import org.egov.tracer.model.CustomException;
import org.egov.tracer.model.ServiceCallException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Repository;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;

@Slf4j
@Repository
public class UserUtils {


    @Value("${egov.statelevel.tenant}")
    private String stateLevelTenant;

    @Value("${egov.user.host}${egov.user.search.path}")
    private String userSearchURI;

    private RestTemplate restTemplate;

    private ObjectMapper objectMapper;


    @Autowired
    public UserUtils(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }


    @Cacheable(value = "systemUser" , sync = true)
    public User fetchSystemUser(){

        UserSearchRequest userSearchRequest =new UserSearchRequest();
        userSearchRequest.setRoleCodes(Collections.singletonList("ANONYMOUS"));
        userSearchRequest.setUserType("SYSTEM");
        userSearchRequest.setPageSize(1);
        userSearchRequest.setTenantId(stateLevelTenant);

        StringBuilder uri = new StringBuilder(userSearchURI);
        User user = null;
        try {
           UserDetailResponse response = restTemplate.postForObject(uri.toString(), userSearchRequest, UserDetailResponse.class);
           user = response.getUser().get(0);
        }
        catch(HttpClientErrorException e) {
            log.error("External Service threw an Exception: ",e);
            throw new ServiceCallException(e.getResponseBodyAsString());
        }catch(Exception e) {
            log.error("Exception while fetching from searcher: ",e);
        }

        /*if(user == null)
            throw new CustomException("NO_SYSTEUSER_FOUND","No system user found");*/

        return user;
    }




}
