package org.egov.url.shortening.repository;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Date;

import org.egov.url.shortening.model.ShortenRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.PreparedStatementCallback;
import org.springframework.stereotype.Repository;

import lombok.extern.slf4j.Slf4j;

@Repository
@Slf4j
@Order(1)
public class UrlDBRepository implements URLRepository{
	
	
	private JdbcTemplate jdbcTemplate;
	
	
	@Autowired
	public UrlDBRepository(JdbcTemplate jdbcTemplate){
		this.jdbcTemplate = jdbcTemplate;
	}
	
	@Override
	public Long incrementID() {
		String query = "SELECT nextval('eg_url_shorter_id')";
        Long id = jdbcTemplate.queryForObject(query, new Object[] {}, Long.class);
        log.info("Incrementing ID: {}", id-1);
        return id - 1;
    }

	@Override
    public void saveUrl(String key, ShortenRequest shortenRequest) {

    	String query = "INSERT INTO eg_url_shortener "
    			+ "(id,validform,validto,url,created_by,created_time,last_modified_by,last_modified_time) "
    			+ "values (?,?,?,?,?,?,?,?)";
    	log.info("Saving: {} at {}", shortenRequest.getUrl(), key);
        Boolean b = jdbcTemplate.execute(query,new PreparedStatementCallback<Boolean>(){  
            @Override  
            public Boolean doInPreparedStatement(PreparedStatement ps)  
                    throws SQLException, DataAccessException {  
                      
                ps.setString(1,key);
                ps.setObject(2,shortenRequest.getValidFrom());
                ps.setLong(3,shortenRequest.getValidTill());
                ps.setString(4,shortenRequest.getUrl());  
                ps.setString(5,"1");
                ps.setLong(6,new Date().getTime());
                ps.setString(7,"1");
                ps.setLong(8,new Date().getTime());
                      
                return ps.execute();  
                      
            }  
            });  
    }

	@Override
    public String getUrl(Long id) throws Exception {
    	String query =  "SELECT url FROM EG_URL_SHORTENER WHERE id=?";
    	
    	String strprepStmtArgs = "url:"+id;
    	String url = jdbcTemplate.queryForObject(query, new Object[] {strprepStmtArgs}, String.class);
        log.info("Retrieved {} at {}", url ,id);
        if (url == null) {
            throw new Exception("URL at key" + id + " does not exist");
        }
        return url;
    }

}
