package org.egov.chat.xternal.validator;

import com.fasterxml.jackson.databind.node.ObjectNode;
import org.egov.chat.service.validation.CustomValidator;
import org.springframework.stereotype.Component;

@Component
public class RangeValidator implements CustomValidator {

    @Override
    public boolean isValid(ObjectNode params) throws Exception {

        double min = Double.parseDouble(params.get("min").asText());
        double max = Double.parseDouble(params.get("max").asText());

        String rawInput = params.get("rawInput").asText();

        double inputNumber = Double.parseDouble(rawInput);

        if(inputNumber >= min && inputNumber <= max)
            return true;

        return false;
    }

}
