package org.egov.chat.post.systeminitiated.pgr;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.StreamsConfig;
import org.apache.kafka.streams.kstream.Consumed;
import org.apache.kafka.streams.kstream.KStream;
import org.apache.kafka.streams.kstream.Produced;
import org.egov.chat.config.KafkaStreamsConfig;
import org.egov.chat.post.systeminitiated.SystemInitiatedEventFormatter;
import org.egov.chat.util.LocalizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Properties;

@Slf4j
@Component
public class PGRStatusUpdateEventFormatter implements SystemInitiatedEventFormatter {

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private RestTemplate restTemplate;
    @Autowired
    private KafkaStreamsConfig kafkaStreamsConfig;
    @Autowired
    private LocalizationService localizationService;

    private String complaintCategoryLocalizationPrefix = "pgr.complaint.category.";

    @Value("${state.level.tenant.id}")
    private String stateLevelTenantId;
    @Value("${egov.external.host}")
    private String egovExternalHost;

    @Value("${user.service.host}")
    private String userServiceHost;
    @Value("${user.service.search.path}")
    private String userServiceSearchPath;

    @Value("${pgr.service.host}")
    private String pgrServiceHost;
    @Value("${pgr.service.search.path}")
    private String pgrServiceSearchPath;

    private String userServiceSearchRequest = "{\"RequestInfo\":{},\"tenantId\":\"\",\"id\":[\"\"]}";

    private String complaintDetailsRequest = "{\"RequestInfo\":{\"authToken\":\"\",\"userInfo\":{}}}";

    @Override
    public String getStreamName() {
        return "pgr-update-formatter";
    }

    @Override
    public void startStream(String inputTopic, String outputTopic) {
        Properties streamConfiguration = kafkaStreamsConfig.getDefaultStreamConfiguration();
        streamConfiguration.put(StreamsConfig.APPLICATION_ID_CONFIG, getStreamName());
        StreamsBuilder builder = new StreamsBuilder();
        KStream<String, JsonNode> messagesKStream = builder.stream(inputTopic, Consumed.with(Serdes.String(),
                kafkaStreamsConfig.getJsonSerde()));

        messagesKStream.flatMapValues(event -> {
            try {
                return createChatNodes(event);
            } catch (Exception e) {
                log.error(e.getMessage());
                return Collections.emptyList();
            }
        }).to(outputTopic, Produced.with(Serdes.String(), kafkaStreamsConfig.getJsonSerde()));

        kafkaStreamsConfig.startStream(builder, streamConfiguration);

    }

    @Override
    public List<JsonNode> createChatNodes(JsonNode event) throws Exception {
        List<JsonNode> chatNodes = new ArrayList<>();

        String mobileNumber = event.at("/services/0/citizen/mobileNumber").asText();
        String status = event.at("/services/0/status").asText();

        JsonNode complaintDetails = getComplaintDetails(event);

        ObjectNode chatNode = objectMapper.createObjectNode();
        chatNode.put("tenantId", stateLevelTenantId);

        ObjectNode user = objectMapper.createObjectNode();
        user.put("mobileNumber", mobileNumber);
        chatNode.set("user", user);

        chatNode.set("response", createResponseMessage(event));

        if(status.equalsIgnoreCase("resolved")) {
            addImageWhenResolved(event, chatNode);
        }

        chatNodes.add(chatNode);

        if(status.equalsIgnoreCase("assigned")) {
            chatNodes.addAll(createChatNodeForAssignee(event, complaintDetails));
        }

        return chatNodes;
    }

    private List<JsonNode> createChatNodeForAssignee(JsonNode event, JsonNode complaintDetails) throws Exception {
        List<JsonNode> chatNodes = new ArrayList<>();

        JsonNode assignee = getAssignee(event);
        String assigneeMobileNumber = assignee.at("/mobileNumber").asText();

        ObjectNode chatNode = objectMapper.createObjectNode();
        chatNode.put("tenantId", stateLevelTenantId);

        ObjectNode user = objectMapper.createObjectNode();
        user.put("mobileNumber", assigneeMobileNumber);
        chatNode.set("user", user);

        chatNode.set("response", createResponseMessageForAssignee(event, assignee));

        chatNodes.add(chatNode);

        if(eventContainsLocation(event))
            chatNodes.add(createLocationNode(event, assignee));

        addImageToChatNodeForAssignee(complaintDetails, chatNode);

        return chatNodes;
    }

    // TODO : Here only single image is being added
    private void addImageToChatNodeForAssignee(JsonNode complaintDetails, JsonNode chatNode) {
        ArrayNode actionHistory = (ArrayNode) complaintDetails.at("/actionHistory/0/actions");
        for(JsonNode action : actionHistory) {
            if(action.get("action").asText().equalsIgnoreCase("open")) {
                ArrayNode media = (ArrayNode) action.get("media");
                if(media.size() > 0) {
                    log.debug("Link to media file : " + media.get(0).asText());
                    ObjectNode response = (ObjectNode) chatNode.get("response");
                    response.put("type", "attachment");
                    ObjectNode attachment = objectMapper.createObjectNode();
                    attachment.put("fileStoreId", media.get(0).asText());
                    response.set("attachment", attachment);
                    return;
                }
            }
        }
        log.debug("No image found for assignee");
    }

    private void addImageWhenResolved(JsonNode event, JsonNode chatNode) {
        ArrayNode actionHistory = (ArrayNode) event.at("/actionInfo");
        for(JsonNode action : actionHistory) {
            if(action.get("action").asText().equalsIgnoreCase("resolve")) {
                ArrayNode media = (ArrayNode) action.get("media");
                if(media.size() > 0) {
                    log.debug("Link to media file : " + media.get(0).asText());
                    ObjectNode response = (ObjectNode) chatNode.get("response");
                    response.put("type", "attachment");
                    ObjectNode attachment = objectMapper.createObjectNode();
                    attachment.put("fileStoreId", media.get(0).asText());
                    response.set("attachment", attachment);
                    return;
                }
            }
        }
        log.debug("No image found when complaint is resolved");
    }

    private JsonNode getComplaintDetails(JsonNode event) throws IOException {
        DocumentContext userInfo =  JsonPath.parse(event.at("/RequestInfo/userInfo").toString());

        log.debug("UserInfo : " + userInfo.jsonString());

        DocumentContext documentContext = JsonPath.parse(complaintDetailsRequest);
        documentContext.set("$.RequestInfo.userInfo", userInfo.json());
        documentContext.set("$.RequestInfo.authToken", "3aa4ece6-cb71-4f61-8a87-9487783a30d2"); // TODO : remove

        JsonNode request = objectMapper.readTree(documentContext.jsonString());

        String serviceRequestId = event.at("/services/0/serviceRequestId").asText();
        String tenantId = event.at("/services/0/tenantId").asText();

        UriComponentsBuilder uriComponents = UriComponentsBuilder.fromUriString(pgrServiceHost + pgrServiceSearchPath);
        uriComponents.queryParam("tenantId", tenantId);
        uriComponents.queryParam("serviceRequestId", serviceRequestId);

        ResponseEntity<ObjectNode> responseEntity = restTemplate.postForEntity(uriComponents.buildAndExpand().toUri(),
                request, ObjectNode.class);

        return responseEntity.getBody();
    }

    private boolean eventContainsLocation(JsonNode event) {
        if(event.get("services").get(0).get("addressDetail").get("latitude") != null)
            return true;
        return false;
    }

    private JsonNode createLocationNode(JsonNode event, JsonNode assignee) {
        ObjectNode chatNode = objectMapper.createObjectNode();
        chatNode.put("tenantId", stateLevelTenantId);

        ObjectNode user = objectMapper.createObjectNode();
        user.put("mobileNumber", assignee.at("/mobileNumber").asText());
        chatNode.set("user", user);

        chatNode.set("response", createLocationResponse(event));

        return chatNode;
    }

    private JsonNode createLocationResponse(JsonNode event) {
        ObjectNode responseMessage = objectMapper.createObjectNode();
        responseMessage.put("type", "location");
        ObjectNode location = objectMapper.createObjectNode();
        location.put("latitude", event.at("/services/0/addressDetail/latitude").toString());
        location.put("longitude", event.at("/services/0/addressDetail/longitude").toString());
        responseMessage.set("location", location);
        return responseMessage;
    }

    private JsonNode createResponseMessageForAssignee(JsonNode event, JsonNode assignee) throws UnsupportedEncodingException {
        ObjectNode responseMessage = objectMapper.createObjectNode();
        responseMessage.put("type", "text");
        String serviceRequestId = event.at("/services/0/serviceRequestId").asText();
        String serviceCode = event.at("/services/0/serviceCode").asText();

        String message = "";
        message += "Hey " + assignee.at("/name").asText() + ",";
        message += "\nYou have been assigned a new complaint to resolve.";
        message += "\nComplaint Number : " + serviceRequestId;
        message += "\nCategory : " + localizationService.getMessageForCode(complaintCategoryLocalizationPrefix + serviceCode);
        message += "\n" + makeEmployeeURLForComplaint(serviceRequestId);

        responseMessage.put("text", message);

        return responseMessage;
    }


    private JsonNode createResponseMessage(JsonNode event) throws IOException {
        String status = event.at("/services/0/status").asText();

        if(status.equalsIgnoreCase("resolved")) {
            return responseForResolvedStatus(event);
        } else if(status.equalsIgnoreCase("assigned")) {
            return responseForAssignedtatus(event);
        }

        return null;
    }

    private JsonNode responseForAssignedtatus(JsonNode event) throws IOException {
        String serviceRequestId = event.at("/services/0/serviceRequestId").asText();
        String serviceCode = event.at("/services/0/serviceCode").asText();

        JsonNode assignee = getAssignee(event);
        String assigneeMobileNumber = assignee.at("/mobileNumber").asText();

        String message = "Your complaint has been assigned.";
        message += "\nComplaint Number : " + serviceRequestId;
        message += "\nCategory : " + localizationService.getMessageForCode(complaintCategoryLocalizationPrefix + serviceCode);
        message += "\nAssignee Mobile Number : " + assigneeMobileNumber;
        message += "\n" + makeCitizenURLForComplaint(serviceRequestId);

        ObjectNode responseMessage = objectMapper.createObjectNode();

        responseMessage.put("type", "text");
        responseMessage.put("text", message);

        return responseMessage;
    }

    private JsonNode getAssignee(JsonNode event) throws IOException {

        String assigneeId = event.at("/actionInfo/0/assignee").asText();
        String tenantId = event.at("/actionInfo/0/tenantId").asText();

        DocumentContext request = JsonPath.parse(userServiceSearchRequest);

        request.set("$.tenantId", tenantId);
        request.set("$.id.[0]", assigneeId);

        JsonNode requestObject = null;
        requestObject = objectMapper.readTree(request.jsonString());

        ResponseEntity<ObjectNode> response = restTemplate.postForEntity(userServiceHost + userServiceSearchPath,
                    requestObject, ObjectNode.class);

        return response.getBody().at("/user/0");
    }

    private JsonNode responseForResolvedStatus(JsonNode event) throws UnsupportedEncodingException {

        String serviceRequestId = event.at("/services/0/serviceRequestId").asText();
        String serviceCode = event.at("/services/0/serviceCode").asText();

        String message = "Your complaint has been resolved.";
        message += "\nComplaint Number : " + serviceRequestId;
        message += "\nCategory : " + localizationService.getMessageForCode(complaintCategoryLocalizationPrefix + serviceCode);
        message += "\nYou can rate the service here : " + makeCitizenURLForComplaint(serviceRequestId);

        ObjectNode responseMessage = objectMapper.createObjectNode();

        responseMessage.put("type", "text");
        responseMessage.put("text", message);

        return responseMessage;
    }

    private String makeCitizenURLForComplaint(String serviceRequestId) throws UnsupportedEncodingException {
        String encodedPath = URLEncoder.encode( serviceRequestId, "UTF-8" );
        String url = egovExternalHost + "/citizen/complaint-details/" + encodedPath;
        return url;
    }

    private String makeEmployeeURLForComplaint(String serviceRequestId) throws UnsupportedEncodingException {
        String encodedPath = URLEncoder.encode( serviceRequestId, "UTF-8" );
        String url = egovExternalHost + "/employee/complaint-details/" + encodedPath;
        return url;
    }

}
