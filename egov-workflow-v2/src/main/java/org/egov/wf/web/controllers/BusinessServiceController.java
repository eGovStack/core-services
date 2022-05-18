package org.egov.wf.web.controllers;


import com.fasterxml.jackson.databind.ObjectMapper;
import org.egov.wf.service.BusinessMasterService;
import org.egov.wf.service.BusinessMasterServiceV2;
import org.egov.wf.util.ResponseInfoFactory;
import org.egov.wf.web.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/egov-wf")
public class BusinessServiceController {

    private BusinessMasterService businessMasterService;
    private BusinessMasterServiceV2 businessMasterServiceV2;

    private final ResponseInfoFactory responseInfoFactory;

    private ObjectMapper mapper;
    private WorkflowUtilV2 workflowUtilV2;

    @Autowired
    public BusinessServiceController(BusinessMasterService businessMasterService,BusinessMasterServiceV2 businessMasterServiceV2, ResponseInfoFactory responseInfoFactory,
                                     ObjectMapper mapper) {
        this.businessMasterService = businessMasterService;
        this.businessMasterServiceV2 = businessMasterServiceV2;
        this.responseInfoFactory = responseInfoFactory;
        this.mapper = mapper;
        this.workflowUtilV2=workflowUtilV2;
    }
   
    /**
     * Controller for creating BusinessService
     * @param businessServiceRequest The BusinessService request for create
     * @return The created object
     */
    @RequestMapping(value="/businessservice/_create", method = RequestMethod.POST)
    public ResponseEntity<BusinessServiceResponse> create(@Valid @RequestBody BusinessServiceRequest businessServiceRequest) {
    	String business=businessServiceRequest.getBusinessServices().get(0).getBusinessService();
    	List<BusinessService> businessServices;
    	if (workflowUtilV2.isV2Service(business)) {
        businessServices = businessMasterServiceV2.create(businessServiceRequest);
    	}
    	else {
    		businessServices = businessMasterService.create(businessServiceRequest);
    	}
        BusinessServiceResponse response = BusinessServiceResponse.builder().businessServices(businessServices)
                .responseInfo(responseInfoFactory.createResponseInfoFromRequestInfo(businessServiceRequest.getRequestInfo(),true))
                .build();
        return new ResponseEntity<>(response,HttpStatus.OK);
    }


    /**
     * Controller for searching BusinessService api
     * @param criteria Object containing the search params
     * @param requestInfoWrapper The requestInfoWrapper object containing requestInfo
     * @return List of businessServices from db based on search params
     */
    @RequestMapping(value="/businessservice/_search", method = RequestMethod.POST)
    public ResponseEntity<BusinessServiceResponse> search(@Valid @RequestParam Map<String,String> criteria,
                                                          @Valid @RequestBody RequestInfoWrapper requestInfoWrapper) {
    	System.out.println(criteria);
        BusinessServiceSearchCriteria searchCriteria = mapper.convertValue(criteria,BusinessServiceSearchCriteria.class);
        BusinessServiceResponse response;
		String businessServicesParms = "";
		if ((searchCriteria.getBusinessServices()!=null)) {
			businessServicesParms = searchCriteria.getBusinessServices().get(0);
		}
		
		if (searchCriteria != null && searchCriteria.getBusinessServices() != null && businessServicesParms!="" && workflowUtilV2.isV2Service(businessServicesParms)) {
			List<String> business = new ArrayList<String>(Arrays.asList(businessServicesParms.split(",")));    
                	BusinessServiceSearchCriteriaV2 searchCriteriaV2 = mapper.convertValue(criteria,BusinessServiceSearchCriteriaV2.class);
        	searchCriteriaV2.setBusinessServices(business);
        	List<BusinessService> businessServices = businessMasterServiceV2.search(searchCriteriaV2);
           response = BusinessServiceResponse.builder().businessServices(businessServices)
                    .responseInfo(responseInfoFactory.createResponseInfoFromRequestInfo(requestInfoWrapper.getRequestInfo(),true))
                    .build();
        }
        else {
        List<BusinessService> businessServices = businessMasterService.search(searchCriteria);
        response = BusinessServiceResponse.builder().businessServices(businessServices)
                .responseInfo(responseInfoFactory.createResponseInfoFromRequestInfo(requestInfoWrapper.getRequestInfo(),true))
                .build();}
        return new ResponseEntity<>(response,HttpStatus.OK);
    }

    @RequestMapping(value="/businessservice/_update", method = RequestMethod.POST)
    public ResponseEntity<BusinessServiceResponse> update(@Valid @RequestBody BusinessServiceRequest businessServiceRequest) {
       
        String business ="";
		if(!businessServiceRequest.getBusinessServices().isEmpty())
		business=businessServiceRequest.getBusinessServices().get(0).getBusinessService();
		List<BusinessService> businessServices;
		if (workflowUtilV2.isV2Service(business)) {
        businessServices = businessMasterServiceV2.update(businessServiceRequest);
    	}
    	else {
    		businessServices = businessMasterService.update(businessServiceRequest);
    	}
        BusinessServiceResponse response = BusinessServiceResponse.builder().businessServices(businessServices)
                .responseInfo(responseInfoFactory.createResponseInfoFromRequestInfo(businessServiceRequest.getRequestInfo(),true))
                .build();
        return new ResponseEntity<>(response,HttpStatus.OK);
    }




}