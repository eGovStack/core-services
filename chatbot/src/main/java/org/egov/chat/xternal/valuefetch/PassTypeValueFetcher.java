package org.egov.chat.xternal.valuefetch;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import net.minidev.json.JSONArray;
import org.egov.chat.service.valuefetch.ExternalValueFetcher;
import org.egov.chat.util.URLShorteningSevice;
import org.egov.common.contract.request.RequestInfo;
import org.egov.mdms.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Component
public class PassTypeValueFetcher implements ExternalValueFetcher {

    @Autowired
    private RestTemplate restTemplate;
    @Autowired
    private ObjectMapper objectMapper;

    private String moduleName = "TradeLicense";
    private String masterDetailsName = "Purpose";

    @Value("${pass.mdms.service.host}")
    private String mdmsHost;
    @Value("${pass.mdms.service.search.path}")
    private String mdmsSearchPath;

    @Override
    public ArrayNode getValues(ObjectNode params) {
        String tenantId = params.get("tenantId").asText();
        return getTypeNames(fetchMdmsData(tenantId), tenantId);
    }

    private ArrayNode getTypeNames(JSONArray mdmsResValues, String tenantId) {
        ArrayNode values = objectMapper.createArrayNode();
        for (Object mdmsResValue : mdmsResValues) {
            ObjectNode value = objectMapper.createObjectNode();
            HashMap mdmsValue = (HashMap) mdmsResValue;
            value.put("value", mdmsValue.get("NAME").toString());
            values.add(value);
        }
        return values;
    }

    private JSONArray fetchMdmsData(String tenantId) {
        MasterDetail masterDetail = MasterDetail.builder().name(masterDetailsName).build();
        ModuleDetail moduleDetail =
                ModuleDetail.builder().moduleName(moduleName).masterDetails(Collections.singletonList(masterDetail)).build();
        MdmsCriteria mdmsCriteria =
                MdmsCriteria.builder().tenantId(tenantId).moduleDetails(Collections.singletonList(moduleDetail)).build();
        MdmsCriteriaReq mdmsCriteriaReq = MdmsCriteriaReq.builder().mdmsCriteria(mdmsCriteria).requestInfo(RequestInfo.builder().build()).build();

        MdmsResponse mdmsResponse = restTemplate.postForObject(mdmsHost + mdmsSearchPath, mdmsCriteriaReq, MdmsResponse.class);

        Map<String, Map<String, JSONArray>> mdmsRes = mdmsResponse.getMdmsRes();

        JSONArray mdmsResValues = mdmsRes.get(moduleName).get(masterDetailsName);

        return mdmsResValues;
    }


    @Override
    public String getCodeForValue(ObjectNode params, String value) {
        String tenantId = params.get("tenantId").asText();
        JSONArray mdmsData = fetchMdmsData(tenantId);
        for(Object mdmsRecord : mdmsData) {
            HashMap<String, String> mdmsValue = (HashMap<String, String>) mdmsRecord;
            if(mdmsValue.get("NAME").equalsIgnoreCase(value)) {
                return mdmsValue.get("code");
            }
        }
        return value;
    }

    @Override
    public String createExternalLinkForParams(ObjectNode params) {
        return null;
    }
}
