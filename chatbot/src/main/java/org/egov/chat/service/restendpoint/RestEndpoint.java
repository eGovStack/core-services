package org.egov.chat.service.restendpoint;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.jayway.jsonpath.internal.filter.ValueNode;

public interface RestEndpoint {

    public ObjectNode getMessageForRestCall(ObjectNode params, JsonNode chatNode) throws Exception;

}
