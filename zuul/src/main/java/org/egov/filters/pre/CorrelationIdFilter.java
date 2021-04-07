package org.egov.filters.pre;

import static java.util.Objects.isNull;
import static org.egov.constants.RequestContextConstants.CORRELATION_ID_KEY;
import static org.egov.constants.RequestContextConstants.REQUEST_INFO_FIELD_NAME_CAMEL_CASE;
import static org.egov.constants.RequestContextConstants.REQUEST_INFO_FIELD_NAME_PASCAL_CASE;
import static org.egov.constants.RequestContextConstants.REQUEST_TENANT_ID_KEY;
import static org.egov.constants.RequestContextConstants.TENANTID_MDC;
import static org.egov.constants.RequestContextConstants.USER_INFO_KEY;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;

import org.egov.Utils.Utils;
import org.egov.contract.User;
import org.egov.exceptions.CustomException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeType;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;

/**
 *  1st pre filter to get executed.
 *  Sets the context and MDC with the newly generated correlation id.
 */
@Component
public class CorrelationIdFilter extends ZuulFilter {
	
	@Autowired
    private ObjectMapper objectMapper;

    private static final String RECEIVED_REQUEST_MESSAGE = "Received request for: {}";

    private Logger logger = LoggerFactory.getLogger(this.getClass());

    @Override
    public String filterType() {
        return "pre";
    }

    @Override
    public int filterOrder() {
        return 0;
    }

    @Override
    public boolean shouldFilter() {
        return true;
    }

    @Override
    public Object run() throws CustomException {
        RequestContext ctx = RequestContext.getCurrentContext();
        
        Set<String> tenantIds = getTenantIdsFromRequest();
        if(tenantIds.size() > 1 || tenantIds.size() == 0) {
        	throw new CustomException("Request must contain unique value of tenantId", 400, "multiple tenantids found in Request body");
        }
        String tenantId = tenantIds.toArray(new String[0])[0];
        MDC.put(TENANTID_MDC, tenantId);
        
        final String correlationId = UUID.randomUUID().toString();
        MDC.put(CORRELATION_ID_KEY, correlationId);
        ctx.set(CORRELATION_ID_KEY, correlationId);
        logger.debug(RECEIVED_REQUEST_MESSAGE, ctx.getRequest().getRequestURI());
        return null;
    }
    
	private Set<String> getTenantIdsFromRequest() {

		RequestContext ctx = RequestContext.getCurrentContext();
		HttpServletRequest request = ctx.getRequest();
		Map<String, List<String>> queryParams = ctx.getRequestQueryParams();

		Set<String> tenantIds = new HashSet<>();

		if (Utils.isRequestBodyCompatible(request)) {

			try {
				ObjectNode requestBody = (ObjectNode) objectMapper.readTree(request.getInputStream());

				if (requestBody.has(REQUEST_INFO_FIELD_NAME_PASCAL_CASE))
					requestBody.remove(REQUEST_INFO_FIELD_NAME_PASCAL_CASE);

				else if (requestBody.has(REQUEST_INFO_FIELD_NAME_CAMEL_CASE))
					requestBody.remove(REQUEST_INFO_FIELD_NAME_CAMEL_CASE);

				List<String> tenants = new LinkedList<>();

				for (JsonNode node : requestBody.findValues(REQUEST_TENANT_ID_KEY)) {
					if (node.getNodeType() == JsonNodeType.ARRAY) {
						node.elements().forEachRemaining(n -> tenants.add(n.asText()));
					} else if (node.getNodeType() == JsonNodeType.STRING) {
						tenants.add(node.asText());
					}
				}
				if (!tenants.isEmpty())
					// Filtering null tenantids will be removed once fix is done in TL service.
					tenants.forEach(tenant -> {
						if (tenant != null && !tenant.equalsIgnoreCase("null"))
							tenantIds.add(tenant);
					});
				else {
					if (!isNull(queryParams) && queryParams.containsKey(REQUEST_TENANT_ID_KEY)
							&& !queryParams.get(REQUEST_TENANT_ID_KEY).isEmpty()) {
						String tenantId = queryParams.get(REQUEST_TENANT_ID_KEY).get(0);
						if (tenantId.contains(",")) {
							tenantIds.addAll(Arrays.asList(tenantId.split(",")));
						} else
							tenantIds.add(tenantId);

					}
				}

			} catch (IOException e) {
				throw new RuntimeException(new CustomException("REQUEST_PARSE_FAILED", HttpStatus.UNAUTHORIZED.value(),
						"Failed to parse request at" + " API gateway"));
			}
		}

		if (tenantIds.isEmpty()) {
			tenantIds.add(((User) ctx.get(USER_INFO_KEY)).getTenantId());
		}

		return tenantIds;
	}

}