package org.egov.access.persistence.repository.querybuilder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class ActionQueryBuilder {

	private static final Logger logger = LoggerFactory.getLogger(ActionQueryBuilder.class);

	public static String insertActionQuery() {

		return "INSERT INTO eg_action(id,name,url,servicecode,queryparams,parentmodule,ordernumber,displayname,enabled,createdby,lastmodifiedby,createddate,lastmodifieddate) values "
				+ "(nextval('seq_eg_action'),:name,:url,:servicecode,:queryparams,:parentmodule,:ordernumber,:displayname,:enabled,:createdby,:lastmodifiedby,:createddate,:lastmodifieddate)";
	}

	public static String updateActionQuery() {
		return "update eg_action set url=:url,servicecode=:servicecode, queryparams=:queryparams, parentmodule=:parentmodule,ordernumber=:ordernumber,displayname=:displayname,enabled=:enabled,lastmodifiedby=:lastmodifiedby,lastmodifieddate=:lastmodifieddate where name=:name";
	}

	public static String checkActionNameExit() {

		return "select id from eg_action where name= :name";
	}

	public static String checkCombinationOfUrlAndqueryparamsExist() {

		return "select id from eg_action where url=:url and queryparams=:queryparams";

	}
}
