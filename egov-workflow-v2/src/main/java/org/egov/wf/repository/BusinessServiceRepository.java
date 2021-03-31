package org.egov.wf.repository;

import lombok.extern.slf4j.Slf4j;
import org.egov.wf.config.WorkflowConfig;
import org.egov.wf.repository.querybuilder.BusinessServiceQueryBuilder;
import org.egov.wf.repository.rowmapper.BusinessServiceRowMapper;
import org.egov.wf.web.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Repository
public class BusinessServiceRepository {


    private BusinessServiceQueryBuilder queryBuilder;

    private JdbcTemplate jdbcTemplate;

    private BusinessServiceRowMapper rowMapper;

    private WorkflowConfig config;

    private Map<String, String> businessServicetoIsStateLevel;



    @Autowired
    public BusinessServiceRepository(BusinessServiceQueryBuilder queryBuilder, JdbcTemplate jdbcTemplate,
                                     BusinessServiceRowMapper rowMapper, WorkflowConfig config, Map<String, String> businessServicetoIsStateLevel) {
        this.queryBuilder = queryBuilder;
        this.jdbcTemplate = jdbcTemplate;
        this.rowMapper = rowMapper;
        this.config = config;
        this.businessServicetoIsStateLevel = businessServicetoIsStateLevel;
    }

    public List<BusinessService> getBusinessServices(BusinessServiceSearchCriteria criteria, Boolean isStateLevel){
        List<Object> preparedStmtList = new ArrayList<>();
        String query;
        if(businessServicetoIsStateLevel.containsValue(isStateLevel)){
            BusinessServiceSearchCriteria stateLevelCriteria = new BusinessServiceSearchCriteria(criteria);
            stateLevelCriteria.setTenantIds(Collections.singletonList(criteria.getTenantIds().get(0).split("\\.")[0]));
            query = queryBuilder.getBusinessServices(stateLevelCriteria, preparedStmtList);
        }
        else{
            query = queryBuilder.getBusinessServices(criteria, preparedStmtList);
        }
        return jdbcTemplate.query(query, preparedStmtList.toArray(), rowMapper);
    }






}
