package org.egov.filters.route;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import com.netflix.zuul.exception.ZuulException;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.URL;

@Component
@ConditionalOnProperty( value = "home.isolation.chatbot.router.enabled", havingValue = "true")
public class ChatbotRouter extends ZuulFilter {

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private RestTemplate restTemplate;

    @Value("${chatbot.context.path}")
    private String chatbotContextPath;

    @Value("${egov.home.isolation.case.management.service.host}")
    private String homeIsolationCaseManagementServiceHost;
    @Value("${egov.home.isolation.case.management.service.search.path}")
    private String getHomeIsolationCaseManagementServiceSearchPath;

    @Value("${egov.statelevel.tenant}")
    public String stateLevelTenantId;

    @Value("${home.isolation.chatbot.host}")
    private String homeIsolationChatbotHost;

    @Override
    public String filterType() {
        return "route";
    }

    @Override
    public int filterOrder() {
        return 0;
    }

    @Override
    public boolean shouldFilter() {
        String uri = RequestContext.getCurrentContext().getRequest().getRequestURI();
        return uri.contains(chatbotContextPath);
    }

    @SneakyThrows
    @Override
    public Object run() throws ZuulException {
        RequestContext context = RequestContext.getCurrentContext();
        HttpServletRequest request = context.getRequest();

        String mobileNumber = get10DigitMobileNumber(request);

        boolean isIsolatedUser = isHomeIsolatedUser(mobileNumber);

        if(isIsolatedUser) {
            URL url = new URL(homeIsolationChatbotHost);
            context.setRouteHost(url);
        }

        return null;
    }

    public String get10DigitMobileNumber(HttpServletRequest request) {
        if(request.getParameter("from") != null)
            return request.getParameter("from").substring(2);
        else if(request.getParameter("mobile_number") != null) {
            return request.getParameter("mobile_number").substring(2);
        }
        return "";
    }

    public boolean isHomeIsolatedUser(String mobileNumber) throws IOException {
        String searchUserRequestBody = "{\"RequestInfo\":{},\"mobileNumber\":\"\"}";
        ObjectNode request = (ObjectNode) objectMapper.readTree(searchUserRequestBody);
        request.put("mobileNumber", mobileNumber);
        JsonNode response = restTemplate.postForObject(homeIsolationCaseManagementServiceHost + getHomeIsolationCaseManagementServiceSearchPath,
            request, JsonNode.class);
        ArrayNode cases = (ArrayNode) response.get("cases");

        if(cases.size() > 0) {
            Long currentTime = System.currentTimeMillis();
            for(int i = 0; i < cases.size(); i++) {
                Long endDate = cases.get(i).get("endDate").asLong();
                if(endDate > currentTime) {
                    return true;
                }
            }
        }
        return false;
    }

}
