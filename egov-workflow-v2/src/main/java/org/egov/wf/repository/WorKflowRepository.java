package org.egov.wf.repository;


import lombok.extern.slf4j.Slf4j;
import org.egov.wf.repository.querybuilder.WorkflowQueryBuilder;
import org.egov.wf.repository.rowmapper.WorkflowRowMapper;
import org.egov.wf.web.models.ProcessInstance;
import org.egov.wf.web.models.ProcessInstanceSearchCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

@Repository
@Slf4j
public class WorKflowRepository {

    private WorkflowQueryBuilder queryBuilder;

    private JdbcTemplate jdbcTemplate;

    private WorkflowRowMapper rowMapper;


    @Autowired
    public WorKflowRepository(WorkflowQueryBuilder queryBuilder, JdbcTemplate jdbcTemplate, WorkflowRowMapper rowMapper) {
        this.queryBuilder = queryBuilder;
        this.jdbcTemplate = jdbcTemplate;
        this.rowMapper = rowMapper;
    }


    /**
     * Executes the search criteria on the db
     * @param criteria The object containing the params to search on
     * @return The parsed response from the search query
     */
    public List<ProcessInstance> getProcessInstances(ProcessInstanceSearchCriteria criteria){
        List<Object> preparedStmtList = new ArrayList<>();
        String query = queryBuilder.getProcessInstanceSearchQueryWithState(criteria, preparedStmtList);
        return jdbcTemplate.query(query, preparedStmtList.toArray(), rowMapper);
    }


    /**
     * Returns processInstances for the particular assignee
     * @param criteria The search params object
     * @return List of processInstanceFromRequest assigned to the user
     */
    public List<ProcessInstance> getProcessInstancesForAssignee(ProcessInstanceSearchCriteria criteria){
        List<Object> preparedStmtList = new ArrayList<>();
        if(CollectionUtils.isEmpty(criteria.getStatus())){
            return new LinkedList<>();
        }else{
            String query = queryBuilder.getAssigneeSearchQuery(criteria, preparedStmtList);
            return jdbcTemplate.query(query, preparedStmtList.toArray(), rowMapper);
        }
    }


    /**
     *
     * @param criteria
     * @return
     */
    public List<ProcessInstance> getProcessInstancesForStatus(ProcessInstanceSearchCriteria criteria){
        List<Object> preparedStmtList = new ArrayList<>();

        if(CollectionUtils.isEmpty(criteria.getStatus()))
            return new LinkedList<>();

        String query = queryBuilder.getStatusBasedProcessInstance(criteria, preparedStmtList);
        return jdbcTemplate.query(query, preparedStmtList.toArray(), rowMapper);
    }


    /**
     *
     * @param criteria
     * @return
     */
    public List<ProcessInstance> getProcessInstancesForUserInbox(ProcessInstanceSearchCriteria criteria){
        List<Object> preparedStmtList = new ArrayList<>();

        if(CollectionUtils.isEmpty(criteria.getStatus()))
            return new LinkedList<>();

        String query = queryBuilder.getInboxSearchQuery(criteria, preparedStmtList);
        log.debug("query for status search: "+query+" params: "+preparedStmtList);
        return jdbcTemplate.query(query, preparedStmtList.toArray(), rowMapper);
    }

    /**
     * Returns the count based on the search criteria
     * @param criteria
     * @return
     */
    public Integer getInboxCount(ProcessInstanceSearchCriteria criteria) {
        List<Object> preparedStmtList = new ArrayList<>();
        String query = queryBuilder.getInboxCount(criteria, preparedStmtList);
        Integer count =  jdbcTemplate.queryForObject(query, preparedStmtList.toArray(), Integer.class);
        return count;
    }

    public Integer getProcessInstancesCount(ProcessInstanceSearchCriteria criteria){
        List<Object> preparedStmtList = new ArrayList<>();
        String query = queryBuilder.getProcessInstanceCount(criteria, preparedStmtList);
        return jdbcTemplate.queryForObject(query, preparedStmtList.toArray(), Integer.class);
    }



}
