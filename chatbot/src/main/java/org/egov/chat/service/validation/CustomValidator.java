package org.egov.chat.service.validation;

import com.fasterxml.jackson.databind.node.ObjectNode;

public interface CustomValidator {

    public boolean isValid(ObjectNode params) throws Exception;

}
