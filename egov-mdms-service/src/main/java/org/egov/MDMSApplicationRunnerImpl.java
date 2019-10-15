package org.egov;

import java.util.*;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;


import javax.annotation.PostConstruct;

import org.apache.commons.io.*;
import org.egov.infra.mdms.utils.MDMSConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;

import lombok.extern.slf4j.Slf4j;
import net.minidev.json.JSONArray;


@Component
@Slf4j
public class MDMSApplicationRunnerImpl {

    @Autowired
    public ResourceLoader resourceLoader;

    @Value("${egov.mdms.conf.path}")
    public String mdmsFileDirectory;

    @Value("${masters.config.url}")
    public String masterConfigUrl;

    private static Map<String, Map<String, Map<String, JSONArray>>> tenantMap = new HashMap<>();

    private static Map<String, Map<String, Object>> masterConfigMap = new HashMap<>();

    ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void run() {
        try {
            log.info("Reading yaml files from: " + mdmsFileDirectory);
            LinkedList<String> errorFilesList = new LinkedList<>();
            readMdmsConfigFiles(masterConfigUrl);
            readFiles(mdmsFileDirectory, errorFilesList);
            log.info("List Of Files which has Error while parsing " + errorFilesList);
        } catch (Exception e) {
            log.error("Exception while loading yaml files: ", e);
        }

    }

    public void readFiles(String baseFolderPath, LinkedList<String> errorList) {
        ObjectMapper jsonReader = new ObjectMapper();
        File folder = new File(baseFolderPath);
        File[] listOfFiles = folder.listFiles();
        if (listOfFiles != null) {
            for (int i = 0; i < listOfFiles.length; i++) {
                if (listOfFiles[i].isFile()) {
                    File file = listOfFiles[i];
                    String name = file.getName();
                    String fileExtension = FilenameUtils.getExtension(file.getAbsolutePath()).toLowerCase();


                    if (fileExtension.equalsIgnoreCase("json")
                            || fileExtension.equalsIgnoreCase("yaml")
                            || fileExtension.equalsIgnoreCase("yml")
                    ) {
                        log.debug("Reading file....:- " + file.getAbsolutePath());
                        try {
                            Map<String, Object> jsonMap = jsonReader.readValue(file, Map.class);
                            prepareTenantMap(jsonMap);
                        } catch (Exception e) {
                            log.error("Error occurred while loading file", e);
                            errorList.add(listOfFiles[i].getAbsolutePath());
                        }
                    }
                } else if (listOfFiles[i].isDirectory()) {
                    readFiles(listOfFiles[i].getAbsolutePath(), errorList);
                }
            }
        }
    }

    @SuppressWarnings("unchecked")
    public void prepareTenantMap(Map<String, Object> map) {

        String tenantId = (String) map.get("tenantId");
        String moduleName = (String) map.get("moduleName");
        Set<String> masterKeys = map.keySet();
        String nonMasterKeys = "tenantId,moduleName";
        List<String> ignoreKey = new ArrayList<String>(Arrays.asList(nonMasterKeys.split(",")));
        masterKeys.removeAll(ignoreKey);
        boolean isMergeAllowed;
        Map<String, JSONArray> masterDataMap = new HashMap<>();
        Iterator<String> masterKeyIterator = masterKeys.iterator();
        String masterName = null;
        JSONArray masterDataJsonArray = null;
        while (masterKeyIterator.hasNext()) {
            masterName = masterKeyIterator.next();
            try {
                masterDataJsonArray = JsonPath.read(objectMapper.writeValueAsString(map.get(masterName)),
                        "$");
            } catch (JsonProcessingException e) {
                // TODO Auto-generated catch block
                log.error(e.getMessage());
            }

            if (!tenantMap.containsKey(tenantId)) {
                Map<String, Map<String, JSONArray>> moduleMap = new HashMap<>();
                moduleMap.put(moduleName, masterDataMap);
                tenantMap.put(tenantId, moduleMap);
            } else {
                Map<String, Map<String, JSONArray>> tenantModule = tenantMap.get(tenantId);

                if (!tenantModule.containsKey(moduleName)) {
                    tenantModule.put(moduleName, masterDataMap);
                } else {
                    Map<String, JSONArray> moduleMaster = tenantModule.get(moduleName);
                    isMergeAllowed = isMergeAllowedForMaster(moduleName, masterName);

                    if (!moduleMaster.containsKey(masterName)) {
                        masterDataMap.put(masterName, masterDataJsonArray);
                        moduleMaster.putAll(masterDataMap);
                        tenantModule.put(moduleName, moduleMaster);
                    } else if (moduleMaster.containsKey(masterName) && isMergeAllowed) {
                        JSONArray existingMasterDataJsonArray = moduleMaster.get(masterName);
                        existingMasterDataJsonArray.merge(masterDataJsonArray);
                    } else if ((moduleMaster.containsKey(masterName) && !isMergeAllowed)) {
                        log.error("merge is not allowed for master ++" + moduleName + " " + masterName);
                    }
                }
                tenantMap.put(tenantId, tenantModule);
            }
            masterDataMap.put(masterName, masterDataJsonArray);
        }
    }

    public void readMdmsConfigFiles(String masterConfigUrl) {
        ObjectMapper jsonReader = new ObjectMapper();
        log.info("Loading master configs from: " + masterConfigUrl);
        Map file = null;

        Resource resource = resourceLoader.getResource(masterConfigUrl);
        try {
            file = jsonReader.readValue(resource.getInputStream(), Map.class);
        } catch (IOException e) {
            log.error("Exception while fetching service map for: ", e);
        }
        masterConfigMap = file;
        log.info("the Master config Map : " + masterConfigMap);
    }

    public boolean isMergeAllowedForMaster(String moduleName, String masterName) {
        ObjectMapper mapper = new ObjectMapper();
        boolean isMergeAllowed = false;

        if (masterConfigMap.containsKey(moduleName) && masterConfigMap.get(moduleName).containsKey(masterName)) {
            Object masterData = masterConfigMap.get(moduleName).get(masterName);
            if (masterData != null) {
                try {
                    isMergeAllowed = JsonPath.read(mapper.writeValueAsString(masterData),
                            MDMSConstants.MERGE_FILES);
                } catch (Exception e) {
                }
            }
        }
        return isMergeAllowed;
    }


    public static Map<String, Map<String, Map<String, JSONArray>>> getTenantMap() {
        return tenantMap;
    }

    public static Map<String, Map<String, Object>> getMasterConfigMap() {
        return masterConfigMap;
    }

}
