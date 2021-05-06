package org.egov.filter.route;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;
import java.util.Map;

import org.egov.model.TenantRoutingConfig;
import org.egov.model.TenantRoutingConfigWrapper;
import org.egov.model.TenantServiceMap;
import org.egov.utils.RoutingConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;

import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class RequestRoutFilter extends ZuulFilter {

	@Autowired
	private RoutingConfig routingConfig;

	@Autowired
	private TenantRoutingConfigWrapper tenantRoutingConfigWrapper;

	@Override
	public boolean shouldFilter() {
		return true;
	}

	@Override
	public Object run() {
		System.out.println("route filter");
		RequestContext ctx = RequestContext.getCurrentContext();
		List<TenantRoutingConfig> tenantRoutingConfigs = tenantRoutingConfigWrapper.getTenantRoutingConfig();
		URL url = null;
		for (TenantRoutingConfig tenantRoutingConfig : tenantRoutingConfigs) {
			if (ctx.getRequest().getRequestURI().matches(tenantRoutingConfig.getIncomingURI())) {
				Map<String, String> tenantRoutingMap = tenantRoutingConfig.getTenantRoutingMap();
					String reqTenantId = ctx.getRequest().getHeader("tenantId");
					String routingHost = findTenant(tenantRoutingMap, reqTenantId);
					if (routingHost != null) {
						try {
							url = new URL(routingHost);
							ctx.setRouteHost(url);
						} catch (MalformedURLException e) {
							e.printStackTrace();
						}
						break;
					}
				break;
			}
		}
		return null;
	}

	@Override
	public String filterType() {
		return "route";
	}

	@Override
	public int filterOrder() {
		return 3;
	}

	private String findTenant(Map<String, String> tenantRoutingMap, String reqTenantId) {
		int count = StringUtils.countOccurrencesOf(reqTenantId, ".");
		String tmpTenantId = new String(reqTenantId);
		for (int i = 0; i < count; i++) {
			if (tenantRoutingMap.containsKey(tmpTenantId)) {
				return tenantRoutingMap.get(tmpTenantId);
			}
			tmpTenantId = tmpTenantId.substring(0,tmpTenantId.lastIndexOf("."));
		}
		return null;
	}

}
