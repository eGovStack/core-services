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
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@PropertySource("classpath:xternal.properties")
@Component
public class LocalityNlpValueFetcher implements ExternalValueFetcher {

    @Autowired
    private RestTemplate restTemplate;
    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private LocalizationService localizationService;

    private String requestBodyString = "{\"city\":\"\",\"locality\":\"\"}";
    private String nlpCitySearchPath="/nlp-engine/fuzzy/locality";
    private String getNlpCitySearchhost="http://nlp-engine.egov:8080";

    @Override
    public String getCodeForValue(ObjectNode params, String value) {
        return value;
    }

    @Override
    public String createExternalLinkForParams(ObjectNode params) {
        return null;
    }

    @Override
    public ArrayNode getValues(ObjectNode params) {
        List<String> boundaryDataList = getLocalityList(params);
        ArrayNode data = objectMapper.createArrayNode();
        for(String code:boundaryDataList){
            ObjectNode value = objectMapper.createObjectNode();
            value.put("code", code);
            data.add(value);
        }
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

        String url=getNlpCitySearchhost+nlpCitySearchPath;

        ObjectNode locationData = restTemplate.postForObject(url, requestBody, ObjectNode.class);
        //JsonNode cityDetected=locationData.get("predictions");
        ArrayNode boundries = (ArrayNode) locationData.get("predictions");

        List<String> localities = new ArrayList<>();

        for (JsonNode boundry : boundries) {
            String code = boundry.get("code").asText();
            if(!localities.contains(code))
                localities.add(code);
        }

        if(localities==null||localities.isEmpty())
            throw new CustomException("MISS_SPELL_ERROR_LOCALITY", "Locality you entered does not match with our system data");

        return localities;
    }
}
