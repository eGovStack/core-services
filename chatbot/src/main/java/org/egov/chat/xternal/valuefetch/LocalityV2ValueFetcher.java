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
public class LocalityV2ValueFetcher implements ExternalValueFetcher {

    @Autowired
    private RestTemplate restTemplate;
    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private LocalizationService localizationService;

    private String requestBodyString = "{\"input_city\":\"\",\"input_lang\":\"\"}";
    private String nlpCitySearchPath="/nlp-engine/fuzzy/city";
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
        List<String> cityList = getLocalityList(params);
        ArrayNode data = objectMapper.createArrayNode();
        for(String code:cityList){
            ObjectNode value = objectMapper.createObjectNode();
            value.put("code", code);
            data.add(value);
        }
        return  data;
    }

    List<String> getLocalityList(ObjectNode params){
        JsonNode message = params.get("locality");
        String locality = message.get("rawInput").toString();
        String locale = "english";
        DocumentContext request = JsonPath.parse(requestBodyString);
        request.set("$.input_city", locality);
        request.set("$.input_lang", locale);

        ObjectMapper mapper = new ObjectMapper(new JsonFactory());
        ObjectNode requestBody = null;
        try {
            requestBody = (ObjectNode) mapper.readTree(request.jsonString());
        } catch (IOException e) {
            e.printStackTrace();
        }

        String url=getNlpCitySearchhost+nlpCitySearchPath;

        ObjectNode locationData = restTemplate.postForObject(url, requestBody, ObjectNode.class);
        JsonNode cityDetected=locationData.get("city_detected");
        ObjectReader reader = mapper.readerFor(new TypeReference<List<String>>() {
        });
        List<String> cityList = new ArrayList<>();
        try {
            cityList = reader.readValue(cityDetected);

        } catch (IOException e) {
            e.printStackTrace();
        }
        if(cityList==null||cityList.isEmpty()||(cityList.size()==1 && cityList.get(0).equalsIgnoreCase("Please try again")))
            throw new CustomException("MISS_SPELL_ERROR_CITY", "City you entered does not match with our system data");

        return cityList;
    }
}
