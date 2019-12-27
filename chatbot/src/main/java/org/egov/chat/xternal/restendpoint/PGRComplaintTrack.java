package org.egov.chat.xternal.restendpoint;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;
import lombok.extern.slf4j.Slf4j;
import net.minidev.json.JSONArray;
import org.egov.chat.service.restendpoint.RestEndpoint;
import org.egov.chat.util.NumeralLocalization;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.Date;

@PropertySource("classpath:xternal.properties")
@Component
@Slf4j
public class PGRComplaintTrack implements RestEndpoint {

    @Autowired
    private RestTemplate restTemplate;
    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private NumeralLocalization numeralLocalization;

    private String complaintCategoryLocalizationPrefix = "pgr.complaint.category.";

    private String trackComplaintHeaderLocalizationCode = "chatbot.message.pgrTrackComplaintEndHeader";
    private String complaintSummaryTemplateLocalizationCode = "chatbot.template.pgrTrackComplaintSummary";

    @Value("${egov.external.host}")
    private String egovExternalHost;
    @Value("${pgr.service.host}")
    private String pgrHost;
    @Value("${pgr.service.search.path}")
    private String pgrSearchComplaintPath;
    @Value("${pgr.recent.complaints.count}")
    private Integer numberOfRecentComplaints;

    String pgrRequestBody = "{\"RequestInfo\":{\"authToken\":\"\",\"userInfo\":\"\"}}";

    @Override
    public ObjectNode getMessageForRestCall(ObjectNode params) throws Exception {
        String tenantId = params.get("tenantId").asText();
        String authToken = params.get("authToken").asText();
        DocumentContext userInfo = JsonPath.parse(params.get("userInfo").asText());

        DocumentContext request = JsonPath.parse(pgrRequestBody);
        request.set("$.RequestInfo.authToken", authToken);
        request.set("$.RequestInfo.userInfo",  userInfo.json());

        UriComponentsBuilder uriComponents = UriComponentsBuilder.fromUriString(pgrHost + pgrSearchComplaintPath);
        uriComponents.queryParam("tenantId", tenantId);
        uriComponents.queryParam("noOfRecords", numberOfRecentComplaints);

        JsonNode requestObject = null;
        try {
            requestObject = objectMapper.readTree(request.jsonString());
        } catch (IOException e) {
            e.printStackTrace();
        }

        ObjectNode responseMessage = objectMapper.createObjectNode();
        responseMessage.put("type", "text");
        try {
            ResponseEntity<ObjectNode> response = restTemplate.postForEntity(uriComponents.buildAndExpand().toUri(),
                    requestObject, ObjectNode.class);
            responseMessage = makeMessageForResponse(response);

        } catch (Exception e) {
            responseMessage.put("text", "Error occured");
        }

        return responseMessage;
    }

    private ObjectNode makeMessageForResponse(ResponseEntity<ObjectNode> responseEntity) throws UnsupportedEncodingException {

        ObjectNode responseMessage = objectMapper.createObjectNode();
        responseMessage.put("type", "text");

        ArrayNode localizationCodesArrayNode = objectMapper.createArrayNode();

        if(responseEntity.getStatusCode().is2xxSuccessful()) {

            DocumentContext documentContext = JsonPath.parse(responseEntity.getBody().toString());

            Integer numberOfServices = (Integer) ( (JSONArray) documentContext.read("$..services.length()")) .get(0);

            if(numberOfServices > 0) {
                ObjectNode trackComplaintHeader = objectMapper.createObjectNode();
                trackComplaintHeader.put("code", trackComplaintHeaderLocalizationCode);
                localizationCodesArrayNode.add(trackComplaintHeader);

                for (int i = 0; i < numberOfServices; i++) {
                    if(numberOfServices > 1) {
                        String value = "\n\n*" + (i + 1) + ".* ";
                        localizationCodesArrayNode.addAll(numeralLocalization.getLocalizationCodesForStringContainingNumbers(value));
                    } else {
                        ObjectNode valueString = objectMapper.createObjectNode();
                        valueString.put("value", "\n");
                        localizationCodesArrayNode.add(valueString);
                    }

                    ObjectNode template = objectMapper.createObjectNode();
                    template.put("templateId", complaintSummaryTemplateLocalizationCode);

                    ObjectNode param;

                    ObjectNode params = objectMapper.createObjectNode();

                    String complaintNumber = documentContext.read("$.services.[" + i + "].serviceRequestId");
                    params.set("complaintNumber", numeralLocalization.getLocalizationCodesForStringContainingNumbers(complaintNumber));

                    String complaintCategory = documentContext.read("$.services.[" + i + "].serviceCode");
                    param = objectMapper.createObjectNode();
                    param.put("code", complaintCategoryLocalizationPrefix + complaintCategory);
                    params.set("complaintCategory", param);

                    Date createdDate = new Date((long) documentContext.read("$.services.[" + i + "].auditDetails.createdTime"));
                    String filedDate = getDateFromTimestamp(createdDate);
                    params.set("filedDate", numeralLocalization.getLocalizationCodesForStringContainingNumbers(filedDate));

                    String status = documentContext.read("$.services.[" + i + "].status");
                    param = objectMapper.createObjectNode();
                    param.put("value", status);
                    params.set("status", param);

                    String encodedPath = URLEncoder.encode( documentContext.read("$.services.[" + i + "].serviceRequestId"), "UTF-8" );
                    String url = egovExternalHost + "/citizen/complaint-details/" + encodedPath;
                    param = objectMapper.createObjectNode();
                    param.put("value", url);
                    params.set("url", param);

                    template.set("params", params);

                    localizationCodesArrayNode.add(template);
                }
                responseMessage.set("localizationCodes", localizationCodesArrayNode);
            } else {
                String message = "No complaints to display";
                responseMessage.put("text", message);
            }


        } else {
            responseMessage.put("text", "Error Occured");
        }

        return responseMessage;
    }


    private String getDateFromTimestamp(Date createdDate) {
        String pattern = "dd/MM/yyyy";
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat(pattern);
        return simpleDateFormat.format(createdDate);
    }
}
