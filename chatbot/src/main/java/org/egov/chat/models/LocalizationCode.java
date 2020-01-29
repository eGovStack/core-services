package org.egov.chat.models;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class LocalizationCode {

    private String code;

    private String tenantId;        // Optional. Defaults to state level tenantId

    private String value;

    // OR

    private String templateId;

    private JsonNode params;

}
