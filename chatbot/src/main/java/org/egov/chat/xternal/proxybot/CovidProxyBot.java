package org.egov.chat.xternal.proxybot;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;
import com.jayway.jsonpath.WriteContext;
import lombok.extern.slf4j.Slf4j;
import org.egov.chat.ChatBot;
import org.egov.chat.models.Response;
import org.egov.chat.service.proxybot.ExternalProxyBot;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.Random;

@Slf4j
@Component
public class CovidProxyBot implements ExternalProxyBot {

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private RestTemplate restTemplate;

    @Value("${egov.external.host}")
    private String egovExternalHost;

    @Value("${pgr.service.host}")
    private String pgrHost;
    @Value("${pgr.service.create.path}")
    private String pgrCreateComplaintPath;

    @Value("${covid.bot.host}")
    private String covidBotHost;
    @Value("${covid.bot.path}")
    private String covidBotPath;

    String pgrCreateRequestBody = "{\"RequestInfo\":{\"authToken\":\"\", \"userInfo\": {}}," +
            "\"actionInfo\":[{\"media\":[]}],\"services\":[{\"addressDetail\":{\"city\":\"\",\"landmark\":\"\",\"mohalla\": \"\"," +
            "\"latitude\" : \"\",\"longitude\" : \"\"},\"city\":\"\",\"phone\":\"\",\"serviceCode\":\"\"," +
            "\"source\":\"whatsapp\",\"tenantId\":\"\",\"description\":\"\", \"attributes\": {} }]}";

    @PostConstruct
    public void init() throws IOException {
        ObjectMapper objectMapper = new ObjectMapper(new JsonFactory());
        JsonNode attributes = objectMapper.readTree(ChatBot.class.getClassLoader()
                .getResource("graph/covid/covid-specific-fields.json"));
        WriteContext request = JsonPath.parse(pgrCreateRequestBody);
        DocumentContext documentContext = JsonPath.parse(attributes.toString());
        request.set("$.services.[0].attributes", documentContext.json());
        log.info(request.jsonString());
        pgrCreateRequestBody = request.jsonString();
    }


    @Override
    public ObjectNode getMessage(ObjectNode params) throws Exception {

        ObjectNode proxyBotResponse = null;

        JsonNode questionDetails = params.get("questionDetails");
        if(questionDetails == null || !questionDetails.has("serviceRequestId")) {
            String serviceRequestId = createPGRCase(params);
            questionDetails = objectMapper.createObjectNode();
            ( (ObjectNode) questionDetails).put("serviceRequestId", serviceRequestId);

            JsonNode proxyBotCreateCaseResponse = createProxyBotCase(serviceRequestId);
            String proxyBotCaseId = proxyBotCreateCaseResponse.at("/id").asText();
            ( (ObjectNode) questionDetails).put("proxyBotCaseId", proxyBotCaseId);

            proxyBotResponse = createProxyBotResponse(proxyBotCreateCaseResponse, (ObjectNode) questionDetails);

        } else {
            String proxyBotCaseId = questionDetails.get("proxyBotCaseId").asText();
            String userInput = params.get("message").asText();
            JsonNode proxyBotPatchCaseResponse = patchProxyBotCase(proxyBotCaseId, userInput);
            proxyBotResponse = createProxyBotResponse(proxyBotPatchCaseResponse, (ObjectNode) questionDetails);
        }

        proxyBotResponse.set("questionDetails", questionDetails);

        return proxyBotResponse;
    }

    private ObjectNode createProxyBotResponse(JsonNode response, ObjectNode questionDetails) {
        log.info("Covid Proxy Bot Response Json : " + response.toString());
        ObjectNode proxyBotResponse = objectMapper.createObjectNode();

        ObjectNode responseMessage = objectMapper.createObjectNode();
        responseMessage.put("type", "text");
        responseMessage.put("text", response.at("/display_text").asText());

        if(response.at("/status").asText().equalsIgnoreCase("under_screening")) {
            proxyBotResponse.put("continue", true);
            proxyBotResponse.set("response", responseMessage);
        } else {
            proxyBotResponse.put("continue", false);
            ObjectNode data = objectMapper.createObjectNode();
            data.set("finalResponse", responseMessage);
            ObjectNode attributes = (ObjectNode) response.at("/case_object/fields");
            attributes.set("id", response.at("/case_object/pk"));
            data.set("attributes", attributes);
            data.set("serviceRequestId", questionDetails.get("serviceRequestId"));
            proxyBotResponse.set("data", data);
        }

        return proxyBotResponse;
    }


    private JsonNode createProxyBotCase(String serviceRequestId) {
        ObjectNode request = objectMapper.createObjectNode();
        request.put("external_case_id", serviceRequestId);
        log.info("Request : " + request.toString());
        log.info("Url : " + covidBotHost + covidBotPath);
        ResponseEntity<JsonNode> responseEntity = restTemplate.postForEntity(covidBotHost + covidBotPath,
                request, JsonNode.class);
        return responseEntity.getBody().get(0);
    }

    private JsonNode patchProxyBotCase(String id, String userInput) {
        ObjectNode request = objectMapper.createObjectNode();
        request.put("user_response", userInput);
        log.info("Request : " + request.toString());
        log.info("Url : " + covidBotHost + covidBotPath + id + "/");
        ResponseEntity<JsonNode> responseEntity = restTemplate.postForEntity(covidBotHost + covidBotPath + id + "/",
                request, JsonNode.class);
        return responseEntity.getBody().get(0);
    }

    private String createPGRCase(ObjectNode params) throws IOException {
        String authToken = params.get("authToken").asText();
        String mobileNumber = params.get("mobileNumber").asText();
        String complaintType = "Others";
        String city = params.get("covid.tenantId").asText();
        String locality = params.get("covid.locality").asText();

        DocumentContext userInfo = JsonPath.parse(params.get("userInfo").asText());
        WriteContext request = JsonPath.parse(pgrCreateRequestBody);
        request.set("$.RequestInfo.authToken", authToken);
        request.set("$.RequestInfo.userInfo", userInfo.json());
        request.set("$.services.[0].city", city);
        request.set("$.services.[0].tenantId", city);
        request.set("$.services.[0].addressDetail.city", city);
        request.set("$.services.[0].addressDetail.mohalla", locality);
        request.set("$.services.[0].serviceCode", complaintType);
        request.set("$.services.[0].phone", mobileNumber);

        log.info("Covid Create request : " + request.jsonString());
        JsonNode requestObject = null;
        requestObject = objectMapper.readTree(request.jsonString());
        ResponseEntity<ObjectNode> response = restTemplate.postForEntity(pgrHost + pgrCreateComplaintPath,
                requestObject, ObjectNode.class);
        String complaintNumber = response.getBody().get("services").get(0).get("serviceRequestId").asText();
        return complaintNumber;
    }

}
