package org.egov.chat.xternal.restendpoint;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;
import lombok.extern.slf4j.Slf4j;
import org.egov.chat.service.restendpoint.RestEndpoint;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
public class PassVerify implements RestEndpoint {

    @Autowired
    private RestTemplate restTemplate;
    @Autowired
    private ObjectMapper objectMapper;

    @Value("${pass.user.host}")
    private String userServiceHost;
    @Value("${pass.user.oauth.path}")
    private String userServiceOAuthPath;

    @Value("${pass.service.host}")
    private String passServiceHost;
    @Value("${pass.service.search.path}")
    private String passSearchPath;

    private String passSummaryMessage = "Application Number: <app-no>\nName: <name>\nMobile Number: " +
            "<mobile-number>\nPurpose: <purpose>\nStatus: *<status>*";
    private String invalidRequestMessage = "Could not find any pass with that id";

    private String passSearchRequestBody = "{\"RequestInfo\":{\"authToken\":\"\",\"userInfo\":\"\"}}";

    @Override
    public ObjectNode getMessageForRestCall(ObjectNode params) throws Exception {
        String tenantId = params.get("tenantId").asText();
        String stateTenantId = params.get("stateTenantId").asText();
        String mobileNumber = params.get("mobileNumber").asText();

        String passId = params.get("pass.verify.id").asText();

        JsonNode user = getLoggedInUser(mobileNumber, tenantId);

        String authToken = user.get("authToken").asText();

        DocumentContext request = JsonPath.parse(passSearchRequestBody);
        request.set("$.RequestInfo.authToken", authToken);
        JsonNode requestObject = objectMapper.readTree(request.jsonString());

        String url = passServiceHost + passSearchPath;
        url += "?tenantId=" + stateTenantId + "&applicationNumber=" + passId;

        log.info("Request url : " + url);

        ResponseEntity<JsonNode> responseEntity = restTemplate.postForEntity(url, requestObject, JsonNode.class);

        JsonNode responseBody = responseEntity.getBody();

        log.info("Response : " + responseBody.toString());

        ArrayNode licenses = (ArrayNode) responseBody.get("Licenses");

        String message = "";

        if(licenses.size() == 0) {
            message = invalidRequestMessage;
        } else {
            JsonNode license = licenses.get(0);
            message = passSummaryMessage;
            message = message.replace("<app-no>", license.get("applicationNumber").asText());
            message = message.replace("<name>", license.at("/tradeLicenseDetail/owners/0/name").asText());
            message = message.replace("<mobile-number>", license.at("/tradeLicenseDetail/owners/0/mobileNumber").asText());
            message = message.replace("<purpose>", license.at("/tradeLicenseDetail/additionalDetail/purpose").asText());
            message = message.replace("<status>", license.get("status").asText());
        }

        ObjectNode response = objectMapper.createObjectNode();
        response.put("timestamp", System.currentTimeMillis());
        response.put("type", "text");

        response.put("text", message);

        return response;
    }

    public JsonNode getLoggedInUser(String mobileNumber, String tenantId) {
        HttpHeaders headers = getDefaultHttpHeaders();

        MultiValueMap<String, String> formData = getDefaultFormData();
        formData.add("tenantId", tenantId);
        formData.add("username", mobileNumber);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(formData, headers);

        ResponseEntity<JsonNode> loginResponse = restTemplate.postForEntity(userServiceHost + userServiceOAuthPath,
                request, JsonNode.class);

        ObjectNode loginObjectNode = objectMapper.createObjectNode();

        if (loginResponse.getStatusCode().is2xxSuccessful()) {
            JsonNode loginObject = loginResponse.getBody();

            loginObjectNode.set("authToken", loginObject.get("access_token"));
            loginObjectNode.set("refreshToken", loginObject.get("refresh_token"));
            loginObjectNode.set("userInfo", loginObject.get("UserRequest"));
            loginObjectNode.set("expiresIn", loginObject.get("expires_in"));
        }

        return loginObjectNode;
    }

    HttpHeaders getDefaultHttpHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.set("Authorization", "Basic ZWdvdi11c2VyLWNsaWVudDplZ292LXVzZXItc2VjcmV0");
        return headers;
    }

    MultiValueMap<String, String> getDefaultFormData() {
        MultiValueMap<String, String> defaultFormData = new LinkedMultiValueMap<>();

        defaultFormData.add("grant_type", "password");
        defaultFormData.add("password", "123456");
        defaultFormData.add("userType", "CITIZEN");

        return defaultFormData;
    }

}
