/*
 * eGov suite of products aim to improve the internal efficiency,transparency,
 * accountability and the service delivery of the government  organizations.
 *
 *  Copyright (C) 2016  eGovernments Foundation
 *
 *  The updated version of eGov suite of products as by eGovernments Foundation
 *  is available at http://www.egovernments.org
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see http://www.gnu.org/licenses/ or
 *  http://www.gnu.org/licenses/gpl.html .
 *
 *  In addition to the terms of the GPL license to be adhered to in using this
 *  program, the following additional terms are to be complied with:
 *
 *      1) All versions of this program, verbatim or modified must carry this
 *         Legal Notice.
 *
 *      2) Any misrepresentation of the origin of the material is prohibited. It
 *         is required that all modified versions of this material be marked in
 *         reasonable ways as different from the original version.
 *
 *      3) This license does not grant any rights to any user of the program
 *         with regards to rights under trademark law for use of the trade names
 *         or trademarks of eGovernments Foundation.
 *
 *  In case of any queries, you can reach eGovernments Foundation at contact@egovernments.org.
 */

package org.egov.web.notification.sms.config;

import lombok.Getter;
import org.apache.commons.lang3.StringUtils;
import org.egov.web.notification.sms.models.Priority;
import org.egov.web.notification.sms.models.Sms;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import javax.annotation.PostConstruct;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

@Component
@Getter
public class SmsProperties {

    private static final String SMS_PRIORITY_PARAM_VALUE = "sms.%s.priority.param.value";
    private static final String SMS_EXTRA_REQ_PARAMS = "sms.extra.req.params";
    private static final String KEY_VALUE_PAIR_DELIMITER = "&";
    private static final String KEY_VALUE_DELIMITER = "=";

    @Autowired
    private Environment environment;

    @Value("${sms.provider.url}")
    @Getter
    private String smsProviderURL;

    @Value("${sms.sender.username}")
    private String userName;

    @Value("${sms.priority.enabled}")
    private boolean isPriorityEnabled;

    @Value("${sms.sender.password}")
    @Getter
    private String password;

    @Value("${sms.sender}")
    private String smsSender;

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

    @Value("${sms.entity.req.param.name}")
    private String entityParameterName;

    @Value("${sms.template.req.param.name}")
    private String templateParameterName;
    
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
        map.add(userParameterName, userName);
        map.add(passwordParameterName, password);
        map.add(senderIdParameterName, smsSender);
        map.add(mobileNumberParameterName, getMobileNumberWithPrefix(sms.getMobileNumber()));
        //map.add(messageParameterName, sms.getMessage());
        //message is assumed to be splited in three parts first part is actual message, second part template_id and third part entity_code
        Logger log
        = Logger.getLogger( 
        		SmsProperties.class.getName()); 
        log.info("actual message extracted: "+sms.getMessage());
        
        String msgs[]=sms.getMessage().split("\\|"); 
        String dlt_entity_id="1301157492438182299";
        String dlt_template_id="123";
       
        
        String msg=msgs[0];
        
        if(msgs.length>1)
            dlt_entity_id=msgs[1];
        
        if(msgs.length>2)
            dlt_template_id=msgs[2];
       
        log.info("filetered message:"+msg);
        log.info("dlt_entity_id:"+dlt_entity_id);
        log.info("dlt_template_id:"+dlt_template_id);
 
        map.add(messageParameterName,msg );
        map.add("dlt_entity_id",dlt_entity_id);
        map.add("dlt_template_id",dlt_template_id);
        
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
