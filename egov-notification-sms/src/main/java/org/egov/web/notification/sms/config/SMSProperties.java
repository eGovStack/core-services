package org.egov.web.notification.sms.config;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import lombok.Getter;
import org.apache.commons.lang3.StringUtils;
import org.egov.web.notification.sms.models.Priority;
import org.egov.web.notification.sms.models.Sms;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import lombok.Data;
import org.springframework.core.env.Environment;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import javax.annotation.PostConstruct;

@Configuration
@Data
public class SMSProperties {

	private static final String SMS_PRIORITY_PARAM_VALUE = "sms.%s.priority.param.value";
	private static final String SMS_EXTRA_REQ_PARAMS = "sms.extra.req.params";
	private static final String KEY_VALUE_PAIR_DELIMITER = "&";
	private static final String KEY_VALUE_DELIMITER = "=";

	@Autowired
	private Environment environment;

	@Value("${sms.provider.url}")
	@Getter
	public String url;
	
	@Value("${sms.sender.username}")
	public String username;

	@Value("${sms.priority.enabled}")
	private boolean isPriorityEnabled;

	@Value("${sms.sender.password}")
	@Getter
	public String password;
	
	@Value("${sms.sender}")
	public String senderid;

	@Value("${sms.sender.secure.key}")
	public String secureKey;
	
	@Value("#{${sms.config.map}}")
	Map<String, String> configMap;


	@Value("${sms.sender.username.req.param.name}")
	private String userParameterName;

	@Value("${sms.sender.password.req.param.name}")
	private String passwordParameterName;

	@Value("${sms.priority.param.name}")
	private String smsPriorityParameterName;

	@Value("${sms.sender.req.param.name}")
	private String senderIdParameterName;

	@Value("${sms.destination.mobile.req.param.name}")
	private String mobileNumberParameterName;

	@Value("${sms.message.req.param.name}")
	private String messageParameterName;

	@Value("${mobile.number.prefix:}")
	private String mobileNumberPrefix;

	private Map<String, String> extraRequestParameters;

	@Value("#{'${sms.error.codes}'.split(',')}")
	@Getter
	private List<String> smsErrorCodes;

	@PostConstruct
	private void init(){
		if (isExtraRequestParametersPresent()) {
			extraRequestParameters = parseExtraRequestParams();
		}
		else
			extraRequestParameters = Collections.emptyMap();
	}


	public MultiValueMap<String, String> getSmsRequestBody(Sms sms) {
		MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
		map.add(userParameterName, username);
		map.add(passwordParameterName, password);
		map.add(senderIdParameterName, senderid);
		map.add(mobileNumberParameterName, getMobileNumberWithPrefix(sms.getMobileNumber()));
		map.add(messageParameterName, sms.getMessage());
		populateSmsPriority(sms.getPriority(), map);
		populateAdditionalSmsParameters(map);

		return map;
	}

	private void populateSmsPriority(Priority priority, MultiValueMap<String, String> requestBody) {
		if (isPriorityEnabled) {
			requestBody.add(smsPriorityParameterName, getSmsPriority(priority));
		}
	}

	private void populateAdditionalSmsParameters(MultiValueMap<String, String> map) {
		if (isExtraRequestParametersPresent()) {
			map.setAll(parseExtraRequestParams());
		}
	}

	private String getSmsPriority(Priority priority) {
		return getProperty(String.format(SMS_PRIORITY_PARAM_VALUE, priority.toString()));
	}

	private String getMobileNumberWithPrefix(String mobileNumber) {
		return mobileNumberPrefix + mobileNumber;
	}

	private String getProperty(String propKey) {
		return this.environment.getProperty(propKey, "");
	}

	private boolean isExtraRequestParametersPresent() {
		return StringUtils.isNotBlank(getProperty(SMS_EXTRA_REQ_PARAMS));
	}

	private Map<String, String> parseExtraRequestParams() {
		String[] extraParameters = getProperty(SMS_EXTRA_REQ_PARAMS).split(KEY_VALUE_PAIR_DELIMITER);
		final Map<String, String> map = new HashMap<>();
		if (extraParameters.length > 0) {
			for (String extraParm : extraParameters) {
				String[] paramNameValue = extraParm.split(KEY_VALUE_DELIMITER);
				map.put(paramNameValue[0], paramNameValue[1]);
			}
		}
		return map;
	}


}
