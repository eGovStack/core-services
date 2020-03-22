package org.egov.chat.xternal.requestformatter.ValueFirst;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import java.text.SimpleDateFormat;
import java.util.*;

@Slf4j
@Controller
public class DeliveryEvents {

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private KafkaTemplate<String, JsonNode> kafkaTemplate;

    private String valuefirstDeliveryEventsTopicName = "valuefirst-delivery-events";

    @RequestMapping(value = "/delivery-events", method = RequestMethod.POST)
    public ResponseEntity<Object> receiveMessage(@RequestBody JsonNode body,
                                                 @RequestParam Map<String, String> queryParams) throws Exception {

        kafkaTemplate.send(valuefirstDeliveryEventsTopicName, createEvent(body, queryParams));
        return new ResponseEntity<>(new Object(), HttpStatus.OK);
    }

    private JsonNode createEvent(JsonNode body, Map<String, String> queryParams) {
        ObjectNode event =  objectMapper.createObjectNode();
        event.put("id", UUID.randomUUID().toString());
        event.set("body", body);
        JsonNode paramsJsonNode = (ObjectNode) objectMapper.convertValue(queryParams, JsonNode.class);
        event.set("queryParams", paramsJsonNode);
        event.put("timestamp", System.currentTimeMillis());
        return event;
    }

}
