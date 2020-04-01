package org.egov.chat.xternal.restendpoint;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;
import com.jayway.jsonpath.WriteContext;
import lombok.extern.slf4j.Slf4j;
import org.egov.chat.service.restendpoint.RestEndpoint;
import org.egov.chat.util.URLShorteningSevice;
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
public class PassIssue implements RestEndpoint {

    @Autowired
    private URLShorteningSevice urlShorteningService;
    @Autowired
    private RestTemplate restTemplate;
    @Autowired
    private ObjectMapper objectMapper;

    @Value("${egov.external.host}")
    private String egovExternalHost;

    @Value("${pass.user.host}")
    private String userServiceHost;
    @Value("${pass.user.oauth.path}")
    private String userServiceOAuthPath;

    @Value("${pass.service.host}")
    private String passServiceHost;
    @Value("${pass.service.create.path}")
    private String passCreatePath;
    @Value("${pass.service.search.path}")
    private String passSearchPath;
    @Value("${pass.service.update.path}")
    private String passUpdatePath;


    private String message = "Your application number <app-no> for the <pass-type> is submitted for approval. " +
            "You will receive notification when the approving authority has made its decision. ";

    private String createRequestBody = "{\"RequestInfo\":{\"apiId\":\"Rainmaker\",\"ver\":\".01\",\"action\":\"\",\"did\":\"1\",\"key\":\"\",\"msgId\":\"20170310130900|en_IN\",\"requesterId\":\"\",\"authToken\":\"cd34dddf-df09-4c25-825c-55c8342d069a\"},\"Licenses\":[{\"licenseType\":\"PERMANENT\",\"tradeLicenseDetail\":{\"address\":{\"tenantId\":\"in.mp\",\"city\":\"in.mp\"},\"tradeUnits\":[{\"tradeType\":\"INTRASTATE\"}],\"additionalDetail\":{\"purpose\":\"DEATH\",\"fromDistrict\":\"MP_ANUPPUR\",\"toDistrict\":\"MP_ASHOKNAGAR\",\"vehicleNumber\":\"\",\"purposeDetail\":\"purpose details\"},\"owners\":[{\"mobileNumber\":\"\",\"name\":\"\"}],\"subOwnerShipCategory\":\"INDIVIDUAL.SINGLEOWNER\",\"applicationDocuments\":null},\"financialYear\":\"2019-20\",\"tenantId\":\"in.mp\",\"workflowCode\":\"NewTL\",\"applicationType\":\"NEW\",\"action\":\"INITIATE\"}]}";

    @Override
    public ObjectNode getMessageForRestCall(ObjectNode params) throws Exception {
        String tenantId = params.get("tenantId").asText();
        String stateTenantId = params.get("stateTenantId").asText();
        String mobileNumber = params.get("mobileNumber").asText();
//        String authToken = params.get("authToken").asText();
//        String userInfo = params.get("userInfo").asText();

        String district = params.get("pass.issue.tenantId").asText();
        String name = params.get("pass.issue.name").asText();
//        String startDate = params.get("pass.issue.startdate").asText();
//        String endDate = params.get("pass.issue.enddate").asText();
        String type = params.get("pass.issue.type").asText();
        String purpose = params.get("pass.issue.purpose").asText();

        String personVehicleChoice = params.get("pass.issue.personvehiclechoice").asText();
        String personVehicleNumber = null;
        if(personVehicleChoice.equalsIgnoreCase("Yes"))
            personVehicleNumber = params.get("pass.issue.personvehiclenumber").asText();

        JsonNode user = getLoggedInUser(mobileNumber, tenantId);
        String authToken = user.get("authToken").asText();

        WriteContext request = JsonPath.parse(createRequestBody);
        request.set("$.RequestInfo.authToken", authToken);
        request.set("$.Licenses.[0].tradeLicenseDetail.additionalDetail.purpose", type);
        request.set("$.Licenses.[0].tradeLicenseDetail.additionalDetail.fromDistrict", district);
        request.set("$.Licenses.[0].tradeLicenseDetail.additionalDetail.toDistrict", district);
        request.set("$.Licenses.[0].tradeLicenseDetail.additionalDetail.purposeDetail", purpose);
        if(personVehicleNumber != null)
            request.set("$.Licenses.[0].tradeLicenseDetail.additionalDetail.vehicleNumber", personVehicleNumber);

        request.set("$.Licenses.[0].tradeLicenseDetail.owners.[0].mobileNumber", mobileNumber);
        request.set("$.Licenses.[0].tradeLicenseDetail.owners.[0].name", name);

        JsonNode requestObject = null;
        requestObject = objectMapper.readTree(request.jsonString());
        ObjectNode responseMessage = objectMapper.createObjectNode();
        responseMessage.put("type", "text");
        ResponseEntity<ObjectNode> createResponse = restTemplate.postForEntity(passServiceHost + passCreatePath,
                requestObject, ObjectNode.class);

        String passId = createResponse.getBody().at("/Licenses/0/applicationNumber").asText();
        log.info("Pass Id : " + passId);

        JsonNode licenses = createResponse.getBody().get("Licenses");
        ((ObjectNode) licenses.at("/0")).put("action", "APPLY");
        ((ObjectNode) licenses.at("/0/tradeLicenseDetail/additionalDetail")).put("declared", true);

        JsonNode requestInfo = requestObject.get("RequestInfo");

        ObjectNode updateRequestObject = createResponse.getBody().deepCopy();
        updateRequestObject.set("RequestInfo", requestInfo);
        updateRequestObject.set("Licenses", licenses);

        ResponseEntity<JsonNode> updateResponse = restTemplate.postForEntity(passServiceHost + passUpdatePath,
                updateRequestObject, JsonNode.class);

        ObjectNode response = objectMapper.createObjectNode();
        response.put("timestamp", System.currentTimeMillis());
        response.put("type", "text");

        String message = this.message;
        message = message.replace("<app-no>", passId);
        message = message.replace("<pass-type>", type);

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
