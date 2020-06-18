package org.egov.chat.xternal.restendpoint;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;
import com.jayway.jsonpath.WriteContext;
import lombok.extern.slf4j.Slf4j;
import org.egov.chat.models.LocalizationCode;
import org.egov.chat.models.Response;
import org.egov.chat.service.restendpoint.RestEndpoint;
import org.egov.chat.util.NumeralLocalization;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.Date;

@Slf4j
@Service
public class HomeIsolationHealthDetails implements RestEndpoint {

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private RestTemplate restTemplate;
    @Autowired
    private NumeralLocalization numeralLocalization;

    @Value("${home.isolation.user.service.host}")
    private String homeIsolationUserServiceHost;
    @Value("${home.isolation.user.service.search.endpoint}")
    private String homeIsolationUserServiceSearchEndpoint;

    @Value("${case.management.service.host}")
    private String caseManagementServiceHost;
    @Value("${case.management.health.detail.create.endpoint}")
    private String healthDetailCreateEndpoint;

    private String healthDetailsCreateRequest = "{\"RequestInfo\":{\"userInfo\":{}},\"tenantId\":\"\",\"mobileNumber\":\"\",\"healthDetails\":[{\"temperature\":98.6,\"symptoms\":\"\",\"breathingIssues\":false,\"fever\":false,\"dryCough\":false}]}";

    private String responseMessageTemplateId = "chatbot.home.isolation.health.detail.create.message";
    private String responseMessageForAlreadySubmittedHealthDetails = "chatbot.home.isolation.health.detail.create.HEALTH_DETAILS_SUBMITTED";

    @Override
    public ObjectNode getMessageForRestCall(ObjectNode params) throws Exception {
        String tenantId = params.get("tenantId").asText();
        String mobileNumber = params.get("mobileNumber").asText();
        Double temperature = Double.parseDouble(params.get("temperature").asText());
        String symptoms = params.get("symptoms").asText();

        JsonNode userInfo = getUserInfo(tenantId, mobileNumber);
        String permanentCity = userInfo.get("permanentCity").asText();

        DocumentContext documentContext = JsonPath.parse(userInfo.toString());
        WriteContext writeContext = JsonPath.parse(healthDetailsCreateRequest);

        writeContext.set("$.RequestInfo.userInfo", documentContext.json());
        writeContext.set("$.tenantId", permanentCity);
        writeContext.set("$.mobileNumber", mobileNumber);
        writeContext.set("$.healthDetails.[0].temperature", temperature);
        writeContext.set("$.healthDetails.[0].symptoms", symptoms);

        writeContext = addSymptomsAsBoolean(symptoms, writeContext);

        JsonNode requestJson = objectMapper.readTree(writeContext.jsonString());
        ResponseEntity<JsonNode> responseEntity = null;
        LocalizationCode localizationCode = null;
        try {
            responseEntity = restTemplate.postForEntity(
                    caseManagementServiceHost + healthDetailCreateEndpoint, requestJson, JsonNode.class);

            Date date = new Date();
            SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy");
            String dateString = formatter.format(date);

            ObjectNode templateParams = objectMapper.createObjectNode();

            ObjectNode localizationCodeDate = objectMapper.createObjectNode();
            localizationCodeDate.put("value", dateString);
            templateParams.set("date", localizationCodeDate);

            localizationCode = LocalizationCode.builder().templateId(responseMessageTemplateId)
                    .params(templateParams).build();
        } catch (HttpClientErrorException e) {
            localizationCode = LocalizationCode.builder().code(responseMessageForAlreadySubmittedHealthDetails).build();
            JsonNode responseJson = objectMapper.readTree(e.getResponseBodyAsString());
            String errorCode = responseJson.at("/Errors/0/code").asText();
            log.info("Error response from case management service : " + responseJson.toString());
            log.info("Error Code : " + errorCode);
        }

        Response response = Response.builder().type("text")
                .localizationCodes(Collections.singletonList(localizationCode)).build();

        ObjectNode objectNode = objectMapper.convertValue(response, ObjectNode.class);

        return objectNode;
    }

    WriteContext addSymptomsAsBoolean(String symptoms, WriteContext writeContext) {
        if(symptoms.contains("fever"))
            writeContext.set("$.healthDetails.[0].fever", true);
        if(symptoms.contains("dry.cough"))
            writeContext.set("$.healthDetails.[0].dryCough", true);
        if(symptoms.contains("breathing.difficulty"))
            writeContext.set("$.healthDetails.[0].breathingIssues", true);
        return writeContext;
    }

    JsonNode getUserInfo(String tenantId, String mobileNumber) throws IOException {
        String searchUserRequestBody = "{\"RequestInfo\":{},\"tenantId\":\"\",\"mobileNumber\":\"\"}";
        ObjectNode request = (ObjectNode) objectMapper.readTree(searchUserRequestBody);
        request.put("tenantId", tenantId);
        request.put("mobileNumber", mobileNumber);
        JsonNode response = restTemplate.postForObject(homeIsolationUserServiceHost + homeIsolationUserServiceSearchEndpoint,
                request, JsonNode.class);
        JsonNode users = response.get("user");

        return users.get(0);
    }

}
