package org.egov.chat.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Iterator;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class TemplateMessageService {

    @Autowired
    private LocalizationService localizationService;

    @Autowired
    private ObjectMapper objectMapper;

    public String getMessageForTemplate(JsonNode localizationCode, String locale) {

        String templateId = localizationCode.get("templateId").asText();
        ObjectNode templateLocalizationNode = objectMapper.createObjectNode();
        templateLocalizationNode.put("code", templateId);
        String templateString = localizationService.getMessageForCode(templateLocalizationNode, locale);

        ObjectNode params = (ObjectNode) localizationCode.get("params");

        Iterator<Map.Entry<String, JsonNode>> paramIterator = params.fields();
        while (paramIterator.hasNext()) {
            Map.Entry<String, JsonNode> param = paramIterator.next();
            String key = param.getKey();

            String localizedValue;
            if(param.getValue().isArray()) {
                localizedValue = "";
                List<String> localizedValues = localizationService.getMessagesForCodes((ArrayNode) param.getValue(), locale);
                for(String string : localizedValues) {
                    localizedValue += string;
                }
            } else {
                localizedValue = localizationService.getMessageForCode(param.getValue(), locale);
            }
            templateString = templateString.replace("{{" + key + "}}", localizedValue);
        }

        log.debug("Contructed Template Message : " + templateString);

        return templateString;
    }

}
