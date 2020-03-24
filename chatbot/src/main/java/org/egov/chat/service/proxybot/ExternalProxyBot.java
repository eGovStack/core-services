package org.egov.chat.service.proxybot;

import com.fasterxml.jackson.databind.node.ObjectNode;

public interface ExternalProxyBot {

    public ObjectNode getMessage(ObjectNode params) throws Exception;

}
