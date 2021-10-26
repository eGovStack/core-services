package org.egov.wf.web.controllers;


import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;

import org.egov.wf.service.WorkflowService;
import org.egov.wf.service.WorkflowServiceV2;
import org.egov.wf.util.ResponseInfoFactory;
import org.egov.wf.web.models.ProcessInstance;
import org.egov.wf.web.models.ProcessInstanceRequest;
import org.egov.wf.web.models.ProcessInstanceResponse;
import org.egov.wf.web.models.ProcessInstanceSearchCriteria;
import org.egov.wf.web.models.ProcessInstanceSearchCriteriaV2;
import org.egov.wf.web.models.RequestInfoWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;


@RestController
@RequestMapping("/egov-wf")
public class WorkflowController {


    private final ObjectMapper objectMapper;

    private final HttpServletRequest request;
    
    private final WorkflowService workflowService;
    private final WorkflowServiceV2 workflowServiceV2;
    

    private final ResponseInfoFactory responseInfoFactory;


    @Autowired
    public WorkflowController(ObjectMapper objectMapper, HttpServletRequest request,
                              WorkflowService workflowService, WorkflowServiceV2 workflowServiceV2,ResponseInfoFactory responseInfoFactory) {
        this.objectMapper = objectMapper;
        this.request = request;
        this.workflowService = workflowService;
        this.workflowServiceV2 = workflowServiceV2;
        this.responseInfoFactory = responseInfoFactory;
    }
  


        @RequestMapping(value="/process/_transition", method = RequestMethod.POST)
        public ResponseEntity<ProcessInstanceResponse> processTransition(@Valid @RequestBody ProcessInstanceRequest processInstanceRequest) {
        		String business=processInstanceRequest.getProcessInstances().get(0).getBusinessService();
        		List<ProcessInstance> processInstances;
        		if(business.equals("FSM")) {
                 processInstances =  workflowServiceV2.transition(processInstanceRequest);
                }
        		else
        			processInstances =  workflowService.transition(processInstanceRequest);
               
                ProcessInstanceResponse response = ProcessInstanceResponse.builder().processInstances(processInstances)
                        .responseInfo(responseInfoFactory.createResponseInfoFromRequestInfo(processInstanceRequest.getRequestInfo(), true))
                        .build();
                return new ResponseEntity<>(response,HttpStatus.OK);
        }




        @RequestMapping(value="/process/_search", method = RequestMethod.POST)
        public ResponseEntity<ProcessInstanceResponse> search(@Valid @RequestBody RequestInfoWrapper requestInfoWrapper,
                                                              @Valid @ModelAttribute ProcessInstanceSearchCriteria criteria) {
        	
                List<ProcessInstance> processInstances = workflowService.search(requestInfoWrapper.getRequestInfo(),criteria);
                
                ProcessInstanceResponse response  = ProcessInstanceResponse.builder().processInstances(processInstances)
                        .build();
                return new ResponseEntity<>(response,HttpStatus.OK);
        }

    /**
     * Returns the count of records matching the given criteria
     * @param requestInfoWrapper
     * @param criteria
     * @return
     */
    @RequestMapping(value="/process/_count", method = RequestMethod.POST)
        public ResponseEntity<Integer> count(@Valid @RequestBody RequestInfoWrapper requestInfoWrapper,
                                                              @Valid @ModelAttribute ProcessInstanceSearchCriteria criteria) {
            Integer count = workflowService.count(requestInfoWrapper.getRequestInfo(),criteria);
            return new ResponseEntity<>(count,HttpStatus.OK);
        }
    
    /**
     * Returns the count of each status of records matching the given criteria
     * @param requestInfoWrapper
     * @param criteria
     * @return
     */
    @RequestMapping(value="/process/_statuscount", method = RequestMethod.POST)
        public ResponseEntity<List> StatusCount(@Valid @RequestBody RequestInfoWrapper requestInfoWrapper,
                                                              @Valid @ModelAttribute ProcessInstanceSearchCriteriaV2 criteria) {
            List  result = workflowServiceV2.statusCount(requestInfoWrapper.getRequestInfo(),criteria);
            return new ResponseEntity<>(result,HttpStatus.OK);
        }





}
