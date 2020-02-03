package org.egov.chat.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;

@PropertySource("classpath:application.properties")
@Component
public class TenantIdWhatsAppNumberMapping {

    @Value("${state.level.tenant.id}")
    private String stateLevelTenantId;
    @Value("${valuefirst.whatsapp.number}")
    private String whatsappNumber;

    // TODO : Remove hard-coded mapping

    public String getTenantIdForNumber(String number) {
        return stateLevelTenantId;
    }

    public String getNumberForTenantId(String tenantId) {
        return whatsappNumber;
    }
}
