package org.egov.pg.utils;

import com.jayway.jsonpath.JsonPath;
import lombok.extern.slf4j.Slf4j;
import net.minidev.json.JSONObject;
import org.egov.common.contract.request.RequestInfo;
import org.egov.pg.config.AppProperties;
import org.egov.pg.producer.Producer;
import org.egov.pg.repository.ServiceCallRepository;
import org.egov.pg.web.models.SMSRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;

import static org.egov.pg.constants.PgConstants.NOTIFICATION_LOCALE;
import static org.egov.pg.constants.PgConstants.PG_NOTIFICATION;

@Component
@Slf4j
public class NotificationUtil {

    @Autowired
    private ServiceCallRepository serviceCallRepository;

    @Autowired
    private AppProperties appProperties;

    @Autowired
    private Producer producer;

    public String getLocalizationMessages(String tenantId, RequestInfo requestInfo, String module) {
        @SuppressWarnings("rawtypes")
        Optional<Object> responseMap = serviceCallRepository.fetchResult(getUri(tenantId, requestInfo, module),
                requestInfo);
        return responseMap.toString();
    }

    public String getUri(String tenantId, RequestInfo requestInfo, String module) {

        if (appProperties.getIsLocalizationStateLevel())
            tenantId = tenantId.split("\\.")[0];

        String locale = NOTIFICATION_LOCALE;
        if (!StringUtils.isEmpty(requestInfo.getMsgId()) && requestInfo.getMsgId().split("|").length >= 2)
            locale = requestInfo.getMsgId().split("\\|")[1];
        StringBuilder uri = new StringBuilder();
        uri.append(appProperties.getLocalizationHost()).append(appProperties.getLocalizationContextPath())
                .append(appProperties.getLocalizationSearchEndpoint()).append("?").append("locale=").append(locale)
                .append("&tenantId=").append(tenantId).append("&module=").append(module);

        return uri.toString();
    }

    public String getCustomizedMsg(String txnStatus, String localizationMessage) {
        StringBuilder notificationCode = new StringBuilder();
        notificationCode.append(PG_NOTIFICATION).append("_").append(txnStatus);
        String path = "$..messages[?(@.code==\"{}\")].message";
        path = path.replace("{}", notificationCode);
        String message = null;
        try {
            ArrayList<String> messageObj = (ArrayList<String>) JsonPath.parse(localizationMessage).read(path);
            if(messageObj != null && messageObj.size() > 0) {
                message = messageObj.get(0);
            }
        } catch (Exception e) {
            log.warn("Fetching from localization failed", e);
        }
        return message;
    }

    /**
     * Send the SMSRequest on the SMSNotification kafka topic
     * @param smsRequestList The list of SMSRequest to be sent
     */
    public void sendSMS(List<SMSRequest> smsRequestList) {
        if (appProperties.getIsSMSEnable()) {
            if (CollectionUtils.isEmpty(smsRequestList)) {
                log.info("Messages from localization couldn't be fetched!");
                return;
            }
            for (SMSRequest smsRequest : smsRequestList) {
                producer.push(appProperties.getSmsNotifTopic(), smsRequest);
                log.info("Messages: " + smsRequest.getMessage());
            }
        }
    }
}
