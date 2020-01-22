package org.egov.report.repository;

import java.sql.SQLException;
import java.util.Date;
import java.util.List;
import java.util.Map;

import lombok.extern.slf4j.Slf4j;
import org.egov.report.repository.builder.ReportQueryBuilder;
import org.egov.swagger.model.ReportDefinition;
import org.egov.swagger.model.ReportRequest;
import org.egov.tracer.model.CustomException;
import org.postgresql.util.PSQLException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import javax.validation.constraints.Null;

@Slf4j
@Repository
public class ReportRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private ReportQueryBuilder reportQueryBuilder;

    @Value("${max.sql.execution.time.millisec:45000}")
    private Long maxExecutionTime;

    @Value(("${report.timeout.for.query}"))
    private int queryExecutionTimeout;


    public List<Map<String, Object>> getData(ReportRequest reportRequest, ReportDefinition reportDefinition, String authToken) throws CustomException {
        Long userId = reportRequest.getRequestInfo().getUserInfo() == null ? null : reportRequest.getRequestInfo().getUserInfo().getId();
        String query = reportQueryBuilder.buildQuery(reportRequest.getSearchParams(), reportRequest.getTenantId(), reportDefinition, authToken, userId);
        Long startTime = new Date().getTime();
        List<Map<String, Object>> maps = null;
        int count = 0;
        log.info("final query:" + query);
        try {
            jdbcTemplate.setQueryTimeout(queryExecutionTimeout);
            maps = jdbcTemplate.queryForList(query);
        } catch (DataAccessResourceFailureException ex) {
            log.info("Query Execution Failed Due To Timeout: ", ex);
            PSQLException cause = (PSQLException) ex.getCause();
            if (cause != null && cause.getSQLState().equals("57014")) {
                throw new CustomException("QUERY_EXECUTION_TIMEOUT", ex.getMessage());
            } else {
                throw ex;
            }
        } catch (Exception e) {
            log.info("Query Execution Failed: ", e);
            throw e;
        }

        Long endTime = new Date().getTime();
        Long totalExecutionTime = endTime - startTime;
        log.info("total query execution time taken in millisecount:" + totalExecutionTime);
        if (endTime - startTime > maxExecutionTime)
            log.error("Sql query is taking time query:" + query);
        return maps;
    }

}
