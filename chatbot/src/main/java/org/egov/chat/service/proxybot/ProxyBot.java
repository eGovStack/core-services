package org.egov.chat.service.proxybot;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;
import lombok.extern.slf4j.Slf4j;
import org.egov.chat.models.EgovChat;
import org.egov.chat.models.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Iterator;
import java.util.List;

@Slf4j
@Service
public class ProxyBot {

    @Autowired
    private List<ExternalProxyBot> externalProxyBotList;

    @Autowired
    private ObjectMapper objectMapper;

    public ObjectNode makeProxyCall(JsonNode config, EgovChat chatNode) throws Exception {

        String restClassName = config.get("class").asText();

        ExternalProxyBot externalProxyBot = getProxyBotClass(restClassName);

        JsonNode chatNodeInJson = objectMapper.valueToTree(chatNode);
        ObjectNode params = makeParamsforConfig(config, chatNodeInJson);

        ObjectNode proxyBotResponse = externalProxyBot.getMessage(params);
        return proxyBotResponse;
    }

    private ObjectNode makeParamsforConfig(JsonNode config, JsonNode chatNode) {

        ObjectNode params = objectMapper.createObjectNode();

        ObjectNode paramConfigurations = (ObjectNode) config.get("params");
        Iterator<String> paramKeys = paramConfigurations.fieldNames();

        while (paramKeys.hasNext()) {
            String key = paramKeys.next();
            JsonNode paramValue;

            String paramConfiguration = paramConfigurations.get(key).asText();

            if (paramConfiguration.substring(0, 1).equalsIgnoreCase("/")) {
                paramValue = chatNode.at(paramConfiguration);
            } else {
                paramValue = TextNode.valueOf(paramConfiguration);
            }

            params.set(key, paramValue);
        }


        return params;

    }


    ExternalProxyBot getProxyBotClass(String className) {
        for(ExternalProxyBot externalProxyBot : externalProxyBotList) {
            if(externalProxyBot.getClass().getName().equalsIgnoreCase(className))
                return externalProxyBot;
        }
        return null;
    }

}
