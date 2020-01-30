package org.egov.chat.models;

import lombok.*;

import java.util.List;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Response {

    private String type;

    private String nodeId;

    private Long timestamp;

    private List<LocalizationCode> localizationCodes;

    private String text;

    // OR

    private String fileStoreId;

}
