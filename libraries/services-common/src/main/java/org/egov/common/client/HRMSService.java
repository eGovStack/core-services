package org.egov.common.client;

import lombok.*;
import org.egov.common.config.*;
import org.egov.common.contract.model.*;
import org.egov.common.contract.request.*;
import org.egov.common.contract.response.*;
import org.egov.common.exceptions.*;

import java.net.*;
import java.util.*;

public class HRMSService {
    private static final String hrmsHost;
    private static final String hrmsContext;

    static {
        hrmsHost = HostConfigs.getHrmsHost();
        hrmsContext = HostConfigs.getHrmsContext();
    }

    @SneakyThrows
    public static URI getUrl(String url) {
        return HttpService.resolveUrl(hrmsHost, hrmsContext, url);
    }

    public static EmployeeResponse createEmployee(EmployeeRequest employeeRequest, HashMap<String, String> queryParams) throws HttpClientException {
        return HttpService.getInstance().post(getUrl("/employees/_create"), employeeRequest, queryParams);
    }

    public static EmployeeResponse updateEmployee(EmployeeRequest employeeRequest, HashMap<String, String> queryParams) throws HttpClientException {
        return HttpService.getInstance().post(getUrl("/employees/_update"), employeeRequest, queryParams);
    }

    public static EmployeeResponse searchEmployee(RequestInfoWrapper requestInfoWrapper, EmployeeSearchCriteria queryParams) throws HttpClientException {
        return HttpService.getInstance().post(getUrl("/employees/_search"), requestInfoWrapper, queryParams);
    }
}
