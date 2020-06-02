package org.egov.common.config;

import java.io.*;
import java.util.*;

public class HostConfigs {
    private static Properties properties;

    static {
        try {
            properties = PropertiesLoader.loadProperties("application.properties");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static String getCommonHost() {
        return properties.getProperty("egov.common.host");
    }

    public static String getMdmsHost() {
        return properties.getProperty("egov.mdms.host", getCommonHost());
    }

    public static String getMdmsContext() {
        return properties.getProperty("egov.mdms.context", "/egov-mdms-service");
    }

    public static String getUserHost() {
        return properties.getProperty("egov.user.host", getCommonHost());
    }


    public static String getUserContext() {
        return properties.getProperty("egov.user.context", "/user");
    }

    public static String getIdgenContext() {
        return properties.getProperty("egov.idgen.context", "/egov-idgen");
    }

    public static String getIdgenHost() {
        return properties.getProperty("egov.idgen.host", getCommonHost());
    }

    public static String getLocalizationHost() {
        return properties.getProperty("egov.localization.host", getCommonHost());
    }

    public static String getLocalizationContext() {
        return properties.getProperty("egov.localization.context", "/localization");
    }

    public static String getHrmsHost() {
        return properties.getProperty("egov.hrms.host", getCommonHost());
    }

    public static String getHrmsContext() {
        return properties.getProperty("egov.hrms.context", "/hr-employee-v2");
    }
}
