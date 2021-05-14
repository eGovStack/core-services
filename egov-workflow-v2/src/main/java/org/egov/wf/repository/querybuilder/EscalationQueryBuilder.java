package org.egov.wf.repository.querybuilder;

import org.apache.commons.lang3.StringUtils;
import org.egov.wf.web.models.EscalationSearchCriteria;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class EscalationQueryBuilder {




    private static final String BASE_QUERY = "SELECT businessId from eg_wf_processinstance_v2 wf WHERE ";


    /**
     * Builds query for searching escalated applications
     * @param criteria
     * @return
     */
    public String getEscalationQuery(EscalationSearchCriteria criteria, List<Object> preparedStmtList){


        StringBuilder builder = new StringBuilder(BASE_QUERY);

        /*
        * To DO
        * Map status to it's uuid before this function is executed
        * */
        builder.append(" wf.status = ? ");
        preparedStmtList.add(criteria.getStatus());

        if(!StringUtils.isEmpty(criteria.getTenantId())){
            builder.append(" AND wf.tenantid = ? ");
            preparedStmtList.add(criteria.getTenantId());
        }

        if(!StringUtils.isEmpty(criteria.getBusinessService())){
            builder.append(" AND wf.businessservice = ? ");
            preparedStmtList.add(criteria.getBusinessService());
        }

        if(criteria.getStateSlaExceededBy() != null){
            builder.append(" AND (select extract(epoch from current_timestamp) * 1000 - wf.createdtime - wf.statesla > ? ");
            preparedStmtList.add(criteria.getStateSlaExceededBy());
        }

        if(criteria.getBusinessSlaExceededBy() != null){
            builder.append(" AND (select extract(epoch from current_timestamp) * 1000 - wf.createdtime - wf.businessservicesla > ? ");
            preparedStmtList.add(criteria.getBusinessSlaExceededBy());
        }

        return builder.toString();


    }


}
