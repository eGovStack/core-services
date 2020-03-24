package org.egov.chat.xternal.proxybot;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.egov.chat.models.Response;
import org.egov.chat.service.proxybot.ExternalProxyBot;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Random;

@Slf4j
@Component
public class CovidProxyBot implements ExternalProxyBot {

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public ObjectNode getMessage(ObjectNode params) throws Exception {
        ObjectNode proxyBotResponse = callProxyBot(params);

        return proxyBotResponse;
    }

    private ObjectNode callProxyBot(ObjectNode params) throws IOException {
        ObjectNode proxyBotResponse = objectMapper.createObjectNode();

        Random random = new Random();
        int option = random.nextInt(3);

        String question = "Question from proxy chatbot. \n Continue by sending any text input.";

        if(option != 0) {
            log.info("Continue forwarding");
            proxyBotResponse.put("continue", true);
        } else {
            log.info("Stop forwarding");
            proxyBotResponse.put("continue", false);

            String dataString = "{\"field1\":\"value1\",\"field2\":\"value2\"}";

            JsonNode data = objectMapper.readTree(dataString);

            proxyBotResponse.set("data", data);
        }

        Response response = Response.builder().type("text").timestamp(System.currentTimeMillis()).nodeId("proxy")
                .text(question).build();
        JsonNode responseJson = objectMapper.convertValue(response, JsonNode.class);
        proxyBotResponse.set("response", responseJson);

        return proxyBotResponse;
    }

}
