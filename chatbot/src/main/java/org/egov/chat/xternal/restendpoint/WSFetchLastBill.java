package org.egov.chat.xternal.restendpoint;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.egov.chat.service.restendpoint.RestEndpoint;
import org.egov.chat.util.FileStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@PropertySource("classpath:xternal.properties")
@Component
@Slf4j
public class WSFetchLastBill implements RestEndpoint {

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private FileStore fileStore;

    @Value("${ws.service.host}")
    private String wsHost;
    @Value("${ws.service.fetch.bill.path}")
    private String wsFetchBillPath;

    private String hardcodedResponse = "{\"message\":\"Dear Consumer,\\nWater bill of Consumer No.: 2113008277 for " +
            "2019-2020-Q2 (Jul to Sept) is Rs. 420.00/- . Payment Due Date: 31/07/2019. \\nThanks,\\nSunam " +
            "Municipal Council\",\"attachmentLink\":\"https://s3.ap-south-1.amazonaws.com/egov-telemetry-data/whatsapp/2113008271_211300000012791.pdf\"}";

    private String hardcodedResponseWithoutAttachment ="{\"message\":\"Dear Consumer,\\nWater bill of Consumer No.: 2113008277 for 2018-2019-Q2 (Jul to Sept) is Rs. 420.00/- . Payment Due Date: 03/07/2019 . Link to pay online http://bit.ly/SunamWater\\nThanks,\\nSunam-DEV Municipal Council\"}";

    @Override
    public ObjectNode getMessageForRestCall(ObjectNode params, JsonNode chatNode) throws Exception {

        String mobileNumber = params.get("mobileNumber").asText();

        // TODO : Make Rest Call to W&S
        ObjectNode wsResponse = (ObjectNode) objectMapper.readTree(hardcodedResponse);

        ObjectNode responseMessage = objectMapper.createObjectNode();

        if(containsAttachment(wsResponse)) {

            log.debug("Contains Attachment");

            responseMessage.put("type", "attachment");
            responseMessage.set("attachment", createAttachmentNode(wsResponse));
        } else {

            log.debug("Only text");

            responseMessage.put("type", "text");
        }

        responseMessage.put("text", wsResponse.get("message").asText());

        return responseMessage;
    }

    public boolean containsAttachment(JsonNode event) {
        if(event.has("attachmentLink"))
            return true;
        return false;
    }

    public JsonNode createAttachmentNode(JsonNode event) {
        ObjectNode attachmentNode = objectMapper.createObjectNode();

        String attachmentLink = event.get("attachmentLink").asText();
        String fileStoreId;
        if(event.has("filename")) {
            String filename = event.get("filename").asText();
            fileStoreId = fileStore.downloadAndStore(attachmentLink, filename);
        } else {
            fileStoreId = fileStore.downloadAndStore(attachmentLink);
        }
        attachmentNode.put("fileStoreId", fileStoreId);

        return attachmentNode;
    }

}
