package org.egov.chat.xternal.requestformatter.karix;//package org.egov.chat.pre.requestformatter.karix;
//
//import com.fasterxml.jackson.databind.JsonNode;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.fasterxml.jackson.databind.node.ObjectNode;
//import com.fasterxml.jackson.databind.node.TextNode;
//import com.jayway.jsonpath.DocumentContext;
//import com.jayway.jsonpath.JsonPath;
//import lombok.extern.slf4j.Slf4j;
//import org.apache.kafka.common.serialization.Serdes;
//import org.apache.kafka.streams.StreamsBuilder;
//import org.apache.kafka.streams.StreamsConfig;
//import org.apache.kafka.streams.kstream.Consumed;
//import org.apache.kafka.streams.kstream.KStream;
//import org.apache.kafka.streams.kstream.Produced;
//import org.egov.chat.config.KafkaStreamsConfig;
//import org.egov.chat.pre.requestformatter.RequestFormatter;
//import org.egov.chat.util.FileStore;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Component;
//
//import java.io.IOException;
//import java.util.Collections;
//import java.util.Properties;
//
//@Slf4j
//@Component
//public class ValueFirstRequestFormatter implements RequestFormatter {
//
//    @Autowired
//    private ObjectMapper objectMapper;
//    @Autowired
//    private KafkaStreamsConfig kafkaStreamsConfig;
//
//    @Autowired
//    private FileStore fileStore;
//
//    @Override
//    public String getStreamName() {
//        return "karix-request-transform";
//    }
//
//    @Override
//    public boolean isValid(JsonNode inputRequest) {
//        try {
//            if(checkForMissedCallNotification(inputRequest))
//                return true;
//
//            String contentType = inputRequest.at(ValueFirstPointerConstants.contentType).asText();
//            if(contentType.equalsIgnoreCase("text") || contentType.equalsIgnoreCase("location")) {
//                return true;
//            } else if(contentType.equalsIgnoreCase("ATTACHMENT")) {
//                String attachmentType = inputRequest.at(ValueFirstPointerConstants.attachmentType).asText();
//                if(attachmentType.equalsIgnoreCase("image"))
//                    return true;
//            }
//        } catch (Exception e) {
//            log.error("Invalid request");
//        }
//        return false;
//    }
//
//    @Override
//    public JsonNode getTransformedRequest(JsonNode inputRequest) throws Exception {
//
//        boolean missedCall = checkForMissedCallNotification(inputRequest);
//        if(missedCall) {
//            inputRequest = makeNodeForMissedCallRequest(inputRequest);
//        }
//
//        String inputMobile = inputRequest.at(ValueFirstPointerConstants.userMobileNumber).asText();
//        String mobileNumber = inputMobile.substring(2, 2 + 10);
//        ObjectNode user = objectMapper.createObjectNode();
//        user.set("mobileNumber", TextNode.valueOf(mobileNumber));
//
//        ObjectNode message = objectMapper.createObjectNode();
//        String contentType = inputRequest.at(ValueFirstPointerConstants.contentType).asText();
//        message.put("type", contentType);
//        if(contentType.equalsIgnoreCase("text")) {
//            message.set("content", inputRequest.at(ValueFirstPointerConstants.textContent));
//        } else if(contentType.equalsIgnoreCase("location")) {
//            message.set("content", TextNode.valueOf(inputRequest.at(ValueFirstPointerConstants.locationContent).toString()));
//        } else if(contentType.equalsIgnoreCase("ATTACHMENT")) {
//            if(inputRequest.at(ValueFirstPointerConstants.attachmentType).asText().equalsIgnoreCase("image")) {
//                message.put("type", "image");
//            }
//            String imageLink = inputRequest.at(ValueFirstPointerConstants.imageFileLink).asText();
//            String fileStoreId = fileStore.downloadFromKarixAndStore(imageLink);
//            message.put("content", fileStoreId);
//        }
//
//        ObjectNode recipient = objectMapper.createObjectNode();
//        recipient.set("to", inputRequest.at(ValueFirstPointerConstants.recipientMobileNumber));
//
//        ObjectNode chatNode = objectMapper.createObjectNode();
//
//        chatNode.set("user", user);
//        chatNode.set("message", message);
//        chatNode.set("recipient", recipient);
//
//        if(missedCall) {
//            chatNode.put("missedCall", true);
//        }
//
//        return chatNode;
//    }
//
//    // TODO : set actual recipient number in input request not missed call number
//    private JsonNode makeNodeForMissedCallRequest(JsonNode inputRequest) throws IOException {
//        JsonNode body = inputRequest.get("body");
//        String recipientNumber = body.get("Callernumber").asText();
//        String userNumber = body.get("UserNumber").asText();
//
//        DocumentContext documentContext = JsonPath.parse("{\"channel\":\"WABA\",\"appDetails\":{\"type\":\"LIVE\"},\"events\":{\"eventType\":\"User initiated\",\"timestamp\":\"1561722407\",\"date\":\"2019-6-28\"},\"eventContent\":{\"message\":{\"from\":\"919428010077\",\"id\":\"ABEGkZQoAQB3Ago6kHmalneqdAmp\",\"text\":{\"body\":\"Hi\"},\"to\":\"919845315868\",\"contentType\":\"text\"}}}");
//        documentContext.set("$.eventContent.message.to", recipientNumber);
//        documentContext.set("$.eventContent.message.from", userNumber);
//
//        JsonNode inputRequestBody = objectMapper.readTree(documentContext.jsonString());
//        ( (ObjectNode) inputRequest).set("body", inputRequestBody);
//
//        return inputRequest;
//    }
//
//    private boolean checkForMissedCallNotification(JsonNode inputRequest) {
//        JsonNode body = inputRequest.get("body");
//        if(body.size() == 2) {
//            if(body.has("Callernumber") && body.has("UserNumber"))
//                return true;
//        }
//        return false;
//    }
//
//    @Override
//    public void startRequestFormatterStream(String inputTopic, String outputTopic, String errorTopic) {
//        Properties streamConfiguration = kafkaStreamsConfig.getDefaultStreamConfiguration();
//        streamConfiguration.put(StreamsConfig.APPLICATION_ID_CONFIG, getStreamName());
//        StreamsBuilder builder = new StreamsBuilder();
//        KStream<String, JsonNode> messagesKStream = builder.stream(inputTopic, Consumed.with(Serdes.String(),
//                kafkaStreamsConfig.getJsonSerde()));
//
//        KStream<String, JsonNode>[] branches = messagesKStream.branch(
//                (key, inputRequest) -> isValid(inputRequest),
//                (key, value) -> true
//        );
//
//        branches[0].flatMapValues(request -> {
//            try {
//                return Collections.singletonList(getTransformedRequest(request));
//            } catch (Exception e) {
//                log.error(e.getMessage());
//                return Collections.emptyList();
//            }
//        }).to(outputTopic, Produced.with(Serdes.String(), kafkaStreamsConfig.getJsonSerde()));
//
//        branches[1].mapValues(request -> request).to(errorTopic, Produced.with(Serdes.String(), kafkaStreamsConfig.getJsonSerde()));
//
//        kafkaStreamsConfig.startStream(builder, streamConfiguration);
//    }
//
//}
