package org.egov.chat.xternal.validator;

import com.fasterxml.jackson.databind.node.ObjectNode;
import org.egov.chat.service.validation.CustomValidator;
import org.springframework.stereotype.Component;

@Component
public class RangeValidator implements CustomValidator {

    @Override
    public boolean isValid(ObjectNode params) throws Exception {

        double min = Double.parseDouble(params.get("min").asText().trim());
        double max = Double.parseDouble(params.get("max").asText().trim());

        String rawInput = params.get("rawInput").asText();

        double inputNumber = Double.parseDouble(rawInput.trim());

        if(inputNumber >= min && inputNumber <= max)
            return true;

        return false;
    }

}
