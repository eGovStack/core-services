package org.egov.common.client;

import lombok.*;
import org.egov.common.config.*;
import org.egov.common.contract.request.*;
import org.egov.common.contract.response.*;
import org.egov.common.exceptions.*;

import java.net.*;
import java.util.*;

public class IdGenService {
    private static final String idgenHost;
    private static final String idgenContext;

    static {
        idgenHost = HostConfigs.getIdgenHost();
        idgenContext = HostConfigs.getIdgenContext();
    }

    @SneakyThrows
    public static URI getUrl(String url) {
        return HttpService.resolveUrl(idgenHost, idgenContext, url);
    }

    public static IdGenerationResponse generateId(
            IdGenerationRequest idGenerationRequest, HashMap<String, String> queryParams) throws HttpClientException {
        return HttpService.getInstance().post(getUrl("/id/_generate"), idGenerationRequest, queryParams);
    }
}
