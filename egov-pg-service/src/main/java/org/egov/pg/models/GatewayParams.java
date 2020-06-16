package org.egov.pg.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.util.Map;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@Slf4j
@Repository
public class GatewayParams {

    //Metdata for payment gateway
    @JsonIgnore
    private Map metaData;

    public Object get(String key) throws Exception {
        if (metaData.containsKey(key)) {
            return metaData.get(key);
        }
        throw new Exception ("Given " + key + " has no value in MDMS");
    }
}
