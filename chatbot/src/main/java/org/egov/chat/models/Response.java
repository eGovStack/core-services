package org.egov.chat.models;

import lombok.*;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Response {

    private String type;

    private List<LocalizationCode> localizationCodes;

    private String text;

    private String fileStoreId;

}
