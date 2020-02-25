package org.egov.chat.post.formatter.ValueFirst;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.egov.chat.config.TenantIdWhatsAppNumberMapping;
import org.egov.chat.post.formatter.ChatNodeJsonPointerConstants;
import org.egov.chat.post.formatter.ResponseFormatter;
import org.egov.chat.util.FileStore;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.net.URLConnection;
import java.net.URLEncoder;
import java.util.*;



@Slf4j
@Component
public class ValueFirstResponseFormatter implements ResponseFormatter {

    @Value("${valuefirst.username}")
    public String valueFirstUsername;

    @Value("${valuefirst.password}")
    public String valueFirstPassword;

    String valueFirstTextMessageRequestBody = "{\"@VER\":\"1.2\",\"USER\":{\"@USERNAME\":\"\",\"@PASSWORD\":\"\",\"@UNIXTIMESTAMP\":\"\"},\"DLR\":{\"@URL\":\"\"},\"SMS\":[{\"@UDH\":\"0\",\"@CODING\":\"1\",\"@TEXT\":\"\",\"@PROPERTY\":\"0\",\"@ID\":\"1\",\"ADDRESS\":[{\"@FROM\":\"\",\"@TO\":\"\",\"@SEQ\":\"\",\"@TAG\":\"\"}]}]}";

    String valueFirstImageMessageRequestBody = "{\"@VER\":\"1.2\",\"USER\":{\"@USERNAME\":\"\",\"@PASSWORD\":\"\",\"@UNIXTIMESTAMP\":\"\"},\"DLR\":{\"@URL\":\"\"},\"SMS\":[{\"@UDH\":\"0\",\"@CODING\":\"1\",\"@TEXT\":\"\",\"@CAPTION\":\"\",\"@TYPE\":\"image\",\"@CONTENTTYPE\":\"image\\/png\",\"@TEMPLATEINFO\":\"\",\"@PROPERTY\":\"0\",\"@ID\":\"XXX\",\"ADDRESS\":[{\"@FROM\":\"\",\"@TO\":\"\",\"@SEQ\":\"1\",\"@TAG\":\"some clientside random data\"}]}]}";

    @Autowired
    private KafkaStreamsConfig kafkaStreamsConfig;
    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private FileStore fileStore;
    @Autowired
    private TenantIdWhatsAppNumberMapping tenantIdWhatsAppNumberMapping;

    private Map<String, String> mimeTypeToAttachmentTypeMapping = new HashMap<String, String>() {{
        put("application/pdf","document");
        put("image/jpeg", "image");
        put("image/png", "image");
    }};

    @Override
    public String getStreamName() {
        return "valuefirst-response-transform";
    }

    @Override
    public void startResponseStream(String inputTopic, String outputTopic) {
        valueFirstTextMessageRequestBody = fillCredentials(valueFirstTextMessageRequestBody);
        valueFirstImageMessageRequestBody = fillCredentials(valueFirstImageMessageRequestBody);
        Properties streamConfiguration = kafkaStreamsConfig.getDefaultStreamConfiguration();
        streamConfiguration.put(StreamsConfig.APPLICATION_ID_CONFIG, getStreamName());
        StreamsBuilder builder = new StreamsBuilder();
        KStream<String, JsonNode> messagesKStream = builder.stream(inputTopic, Consumed.with(Serdes.String(),
                kafkaStreamsConfig.getJsonSerde()));

        messagesKStream.flatMapValues(response -> {
            try {
                return getTransformedResponse(response);
            } catch (Exception e) {
                log.error("error while transforming",e);
                return Collections.emptyList();
            }
        }).to(outputTopic, Produced.with(Serdes.String(), kafkaStreamsConfig.getJsonSerde()));

        kafkaStreamsConfig.startStream(builder, streamConfiguration);

    }

    @Override
    public List<JsonNode> getTransformedResponse(JsonNode response) throws IOException {
        String tenantId = response.at(ChatNodeJsonPointerConstants.tenantId).asText();
        String userMobileNumber = response.at(ChatNodeJsonPointerConstants.toMobileNumber).asText();
        String type = response.at(ChatNodeJsonPointerConstants.responseType).asText();
        String fromMobileNumber = response.at(ChatNodeJsonPointerConstants.fromMobileNumber).asText();
        if((fromMobileNumber==null)||(fromMobileNumber.equals("")))
            throw new CustomException("INVALID_RECEIPIENT_NUMBER","Receipient number can not be empty");
        List<JsonNode> valueFirstRequests = new ArrayList<>();

        log.debug("Response Type : " + type);

        DocumentContext request = null;
//        if(response.has("missedCall") && response.get("missedCall").asBoolean()) {
//            request = JsonPath.parse(karixTemplateMessageRequestBody);
//            request.set("$.message.content.template.templateId", welcomeMessageTemplateId);
//        }
//        else
            if(type.equalsIgnoreCase("text")) {
                request = JsonPath.parse(valueFirstTextMessageRequestBody);
                String message = response.at(ChatNodeJsonPointerConstants.responseText).asText();
                String encodedMessage = URLEncoder.encode( message, "UTF-8" );
                request.set("$.SMS[0].@TEXT", encodedMessage);
            }
            else if(type.equalsIgnoreCase("contactcard")) {
                request = JsonPath.parse(valueFirstTextMessageRequestBody);
                String message = response.at(ChatNodeJsonPointerConstants.responseText).asText();
                String encodedMessage = URLEncoder.encode( message, "UTF-8" );
                request.set("$.SMS[0].@TEXT", encodedMessage);
            }
            else if(type.equalsIgnoreCase("image")) {
                String fileStoreId = response.at(ChatNodeJsonPointerConstants.fileStoreId).asText();
                File file = fileStore.getFileForFileStoreId(fileStoreId);
                String base64Image = fileStore.getBase64EncodedStringOfFile(file);
                file.delete();
                request = JsonPath.parse(valueFirstImageMessageRequestBody);
                String message = response.at(ChatNodeJsonPointerConstants.responseText).asText();
                request.set("$.SMS[0].@TEXT", base64Image);
                request.set("$.SMS[0].@CAPTION", message);
                String uniqueImageMessageId = UUID.randomUUID().toString();
                request.set("$.SMS[0].@ID", uniqueImageMessageId);
            }
//            else if(response.has("missedCall") && response.get("missedCall").asBoolean()) {
//                request = JsonPath.parse(karixTemplateMessageRequestBody);
//                request.set("$.message.content.template.templateId", welcomeMessageTemplateId);
//            }
//        } else if(type.equalsIgnoreCase("attachment")) {
//            request = JsonPath.parse(karixAttachmentMessageRequestBody);
//            request.set("$.message.content.type", type);
//
//            String fileStoreId = response.at(ChatNodeJsonPointerConstants.attachmentFileStoreId).asText();
//            File file = fileStore.getFileForFileStoreId(fileStoreId);
//            String mimeType = URLConnection.guessContentTypeFromName(file.getName());
//            String attachmentType = getTypeFromMime(mimeType);
//            String attachmentData = fileStore.getBase64EncodedStringOfFile(file);
//            file.delete();
//
//            request.set("$.message.content.attachment.type", attachmentType);
//            request.set("$.message.content.attachment.mimeType", mimeType);
//            request.set("$.message.content.attachment.attachmentData", attachmentData);
//
//            if(attachmentType.equalsIgnoreCase("image")) {
//                if(response.at(ChatNodeJsonPointerConstants.responseText) != null)
//                    request.set("$.message.content.attachment.caption",
//                            response.at(ChatNodeJsonPointerConstants.responseText).asText());
//            } else if(attachmentType.equalsIgnoreCase("document")) {
//                request.set("$.message.content.attachment.caption", file.getName());
//
//                if(response.at(ChatNodeJsonPointerConstants.responseText) != null)
//                    valueFirstRequests.add(createTextNodeForAttachment(response));
//            }
//        } else if(type.equalsIgnoreCase("location")) {
//            request = JsonPath.parse(karixLocationRequestBody);
//            request.set("$.message.content.type", type);
//
//            DocumentContext location = JsonPath.parse(response.at(ChatNodeJsonPointerConstants.locationJson).toString());
//
//            request.set("$.message.content.location", location.json());
//        }

        request.set("$.SMS[0].ADDRESS[0].@TO", "91" + userMobileNumber);
        request.set("$.SMS[0].ADDRESS[0].@FROM", tenantIdWhatsAppNumberMapping.getNumberForTenantId(tenantId));

        valueFirstRequests.add(objectMapper.readTree(request.jsonString()));

        log.debug("ValueFirst Requests : " + valueFirstRequests.size());

        return valueFirstRequests;
    }

//    private String getTypeFromMime(String mimeType) {
//        return mimeTypeToAttachmentTypeMapping.get(mimeType);
//    }

//    private JsonNode createTextNodeForAttachment(JsonNode response) throws IOException {
//        String tenantId = response.at(ChatNodeJsonPointerConstants.tenantId).asText();
//        String userMobileNumber = response.at(ChatNodeJsonPointerConstants.toMobileNumber).asText();
//
//        DocumentContext request = null;
//        request = JsonPath.parse(valueFirstTextMessageRequestBody);
//        request.set("$.message.content.type", "text");
//        request.set("$.message.content.text", response.at(ChatNodeJsonPointerConstants.responseText).asText());
//
//        request.set("$.message.recipient.to", "91" + userMobileNumber);
//        request.set("$.message.sender.from", tenantIdWhatsAppNumberMapping.getNumberForTenantId(tenantId));
//
//        return objectMapper.readTree(request.jsonString());
//    }
    public String fillCredentials(String requestBody){
        DocumentContext request = JsonPath.parse(requestBody);
        request.set("$.USER.@USERNAME", valueFirstUsername);
        request.set("$.USER.@PASSWORD", valueFirstPassword);
        return request.jsonString();
    }
}
