package org.egov.common.config;

import java.io.*;
import java.util.*;

public class PropertiesLoader {

    public static Properties loadProperties(String resourceFileName) throws IOException {
        Properties configuration = new Properties();
        InputStream inputStream = PropertiesLoader.class
                .getClassLoader()
                .getResourceAsStream(resourceFileName);

        if (inputStream != null) {
            configuration.load(inputStream);
            inputStream.close();
        } else {
            // should we raise exception?
        }
        return configuration;
    }
}
