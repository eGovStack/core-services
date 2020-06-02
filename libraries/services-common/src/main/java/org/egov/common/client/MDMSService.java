package org.egov.common.client;

import lombok.*;
import org.egov.common.config.*;
import org.egov.common.contract.model.*;
import org.egov.common.contract.request.*;
import org.egov.common.contract.response.*;
import org.egov.common.exceptions.*;

import java.net.*;

public class MDMSService {

    private static final String mdmsHost;
    private static final String mdmsContext;

    static {
        mdmsHost = HostConfigs.getMdmsHost();
        mdmsContext = HostConfigs.getMdmsContext();
    }

    @SneakyThrows
    public static URI getUrl(String url) {
        return HttpService.resolveUrl(mdmsHost, mdmsContext, url);
    }

    public static MdmsResponse get(MdmsSearchQueryParam qp) throws HttpClientException {
        return HttpService.getInstance().get(getUrl("/_get"), qp);
    }


    public static MdmsResponse search(RequestInfo body, MdmsSearchQueryParam qp) throws HttpClientException {
        return HttpService.getInstance().post(getUrl("/_search"), body, qp);
    }
}
