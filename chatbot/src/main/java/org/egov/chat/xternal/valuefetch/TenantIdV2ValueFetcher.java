package org.egov.chat.xternal.valuefetch;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectReader;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;
import org.egov.chat.service.valuefetch.ExternalValueFetcher;
import org.egov.chat.util.LocalizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@PropertySource("classpath:xternal.properties")
@Component
public class TenantIdV2ValueFetcher implements ExternalValueFetcher {

    @Autowired
    private RestTemplate restTemplate;
    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private LocalizationService localizationService;

    private String requestBodyString = "{\"city\":\"\",\"locality\":\"\"}";

    @Override
    public String getCodeForValue(ObjectNode params, String value) {
        return value;
    }

    @Override
    public String createExternalLinkForParams(ObjectNode params) {
        /*List<String> cityList = getLocalityList(params);
        String code=cityList.get(0);
        String locale="en_IN";*/
        String message= "\n\nPlease type and send *\"1\"* to proceed with the above city or send *\"mseva\"* to return";
        return message;
    }

    @Override
    public ArrayNode getValues(ObjectNode params) {
        List<String> cityList = getLocalityList(params);
        ArrayNode data = objectMapper.createArrayNode();
        ObjectNode option1 = objectMapper.createObjectNode();
        option1.put("code", cityList.get(0));
        data.add(option1);
        return  data;
    }

    List<String> getLocalityList(ObjectNode params){
        JsonNode message = params.get("message");
        String locality = message.get("rawInput").toString();
        String tenantId = params.get("tenantId").asText();
        DocumentContext request = JsonPath.parse(requestBodyString);
        request.set("$.locality", locality);
        request.set("$.city", tenantId);

        ObjectMapper mapper = new ObjectMapper(new JsonFactory());
        ObjectNode requestBody = null;
        try {
            requestBody = (ObjectNode) mapper.readTree(request.jsonString());
        } catch (IOException e) {
            e.printStackTrace();
        }

        String url= "http://127.0.0.1:5000/locality";

        ObjectNode locationData = restTemplate.postForObject(url, requestBody, ObjectNode.class);
        JsonNode cityDetected=locationData.get("predictions");
        ObjectReader reader = mapper.readerFor(new TypeReference<List<String>>() {
        });
        List<String> cityList = new ArrayList<>();
        try {
            cityList = reader.readValue(cityDetected);

        } catch (IOException e) {
            e.printStackTrace();
        }
        return cityList;
    }
}
