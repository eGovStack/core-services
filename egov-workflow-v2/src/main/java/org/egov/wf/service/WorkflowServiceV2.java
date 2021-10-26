package org.egov.wf.service;

import org.egov.common.contract.request.RequestInfo;
import org.egov.wf.config.WorkflowConfig;
import org.egov.wf.repository.BusinessServiceRepositoryV2;
import org.egov.wf.repository.WorKflowRepositoryV2;

import org.egov.wf.util.WorkflowUtilV2;
import org.egov.wf.validator.WorkflowValidatorV2;
import org.egov.wf.web.models.*;
import org.egov.wf.util.WorkflowConstantsV2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.*;


@Service
public class WorkflowServiceV2 {

    private WorkflowConfig config;

    private TransitionServiceV2 transitionService;

    private EnrichmentServiceV2 enrichmentService;

    private WorkflowValidatorV2 workflowValidator;

    private StatusUpdateService statusUpdateService;

    private WorKflowRepositoryV2 workflowRepository;

    private WorkflowUtilV2 util;

    private BusinessServiceRepositoryV2 businessServiceRepository;


    @Autowired
    public WorkflowServiceV2(WorkflowConfig config, TransitionServiceV2 transitionService,
                           EnrichmentServiceV2 enrichmentService, WorkflowValidatorV2 workflowValidator,
                           StatusUpdateService statusUpdateService, WorKflowRepositoryV2 workflowRepository,
                           WorkflowUtilV2 util,BusinessServiceRepositoryV2 businessServiceRepository) {
        this.config = config;
        this.transitionService = transitionService;
        this.enrichmentService = enrichmentService;
        this.workflowValidator = workflowValidator;
        this.statusUpdateService = statusUpdateService;
        this.workflowRepository = workflowRepository;
        this.util = util;
        this.businessServiceRepository = businessServiceRepository;
    }


    /**
     * Creates or updates the processInstanceFromRequest
     * @param request The incoming request for workflow transition
     * @return The list of processInstanceFromRequest objects after taking action
     */
    public List<ProcessInstance> transition(ProcessInstanceRequest request){
        RequestInfo requestInfo = request.getRequestInfo();

        List<ProcessStateAndAction> processStateAndActions = transitionService.getProcessStateAndActions(request.getProcessInstances(),true);
        enrichmentService.enrichProcessRequest(requestInfo,processStateAndActions);
        workflowValidator.validateRequest(requestInfo,processStateAndActions);
        statusUpdateService.updateStatus(requestInfo,processStateAndActions);
        return request.getProcessInstances();
    }


    /**
     * Fetches ProcessInstances from db based on processSearchCriteria
     * @param requestInfo The RequestInfo of the search request
     * @param criteria The object containing Search params
     * @return List of processInstances based on search criteria
     */
    public List<ProcessInstance> search(RequestInfo requestInfo,ProcessInstanceSearchCriteriaV2 criteria){
        List<ProcessInstance> processInstances;
        if(criteria.isNull())
            processInstances = getUserBasedProcessInstances(requestInfo, criteria);
        else processInstances = workflowRepository.getProcessInstances(criteria);
        if(CollectionUtils.isEmpty(processInstances))
            return processInstances;

        enrichmentService.enrichUsersFromSearch(requestInfo,processInstances);
        List<ProcessStateAndAction> processStateAndActions = enrichmentService.enrichNextActionForSearch(requestInfo,processInstances);
    //    workflowValidator.validateSearch(requestInfo,processStateAndActions);
        enrichmentService.enrichAndUpdateSlaForSearch(processInstances);
        return processInstances;
    }


    public Integer count(RequestInfo requestInfo,ProcessInstanceSearchCriteriaV2 criteria){
        Integer count;
        if(criteria.isNull()){
            enrichSearchCriteriaFromUser(requestInfo, criteria);
            count = workflowRepository.getInboxCount(criteria);
        }
        else count = workflowRepository.getProcessInstancesCount(criteria);

        return count;
    }





    /**
     * Searches the processInstances based on user and its roles
     * @param requestInfo The RequestInfo of the search request
     * @param criteria The object containing Search params
     * @return List of processInstances based on search criteria
     */
    private List<ProcessInstance> getUserBasedProcessInstances(RequestInfo requestInfo,
                                       ProcessInstanceSearchCriteriaV2 criteria){

        enrichSearchCriteriaFromUser(requestInfo, criteria);
        List<ProcessInstance> processInstances = workflowRepository.getProcessInstancesForUserInbox(criteria);

        processInstances = filterDuplicates(processInstances);

        return processInstances;

    }


    /**
     * Removes duplicate businessId which got created due to simultaneous request
     * @param processInstances
     * @return
     */
    private List<ProcessInstance> filterDuplicates(List<ProcessInstance> processInstances){

        if(CollectionUtils.isEmpty(processInstances))
            return processInstances;

        Map<String,ProcessInstance> businessIdToProcessInstanceMap = new LinkedHashMap<>();

        for(ProcessInstance processInstance : processInstances){
            businessIdToProcessInstanceMap.put(processInstance.getBusinessId(), processInstance);
        }

        return new LinkedList<>(businessIdToProcessInstanceMap.values());
    }
    
    public List statusCount(RequestInfo requestInfo,ProcessInstanceSearchCriteriaV2 criteria){
        List result;
        if(criteria.isNull()&& !criteria.getBusinessService().equalsIgnoreCase(WorkflowConstantsV2.FSM_MODULE)){
        	enrichSearchCriteriaFromUser(requestInfo, criteria);
            result = workflowRepository.getInboxStatusCount(criteria);
        }
        else {
//        	List<String> origCriteriaStatuses = criteria.getStatus();
        	// enrichSearchCriteriaFromUser(requestInfo, criteria);
//        	String tenantId = (criteria.getTenantId() == null ? (requestInfo.getUserInfo().getTenantId()) :(criteria.getTenantId()));
//        	List<String> finalCriteriaStatuses = new ArrayList<String>();
//        	if(origCriteriaStatuses != null && !origCriteriaStatuses.isEmpty()) {
//        		origCriteriaStatuses.forEach((status) ->{
//        			finalCriteriaStatuses.add(tenantId+":"+status);
//        		});
//        		criteria.setStatus(finalCriteriaStatuses);
//        	}
        	result = workflowRepository.getProcessInstancesStatusCount(criteria);
        }

        return result;
    }

    /**
     * Enriches processInstance search criteria based on requestInfo
     * @param requestInfo
     * @param criteria
     */
    private void enrichSearchCriteriaFromUser(RequestInfo requestInfo,ProcessInstanceSearchCriteriaV2 criteria){

        /*BusinessServiceSearchCriteria businessServiceSearchCriteria = new BusinessServiceSearchCriteria();

        *//*
         * If tenantId is sent in query param processInstances only for that tenantId is returned
         * else all tenantIds for which the user has roles are returned
         * *//*
        if(criteria.getTenantId()!=null)
            businessServiceSearchCriteria.setTenantIds(Collections.singletonList(criteria.getTenantId()));
        else
            businessServiceSearchCriteria.setTenantIds(util.getTenantIds(requestInfo.getUserInfo()));

        Map<String, Boolean> stateLevelMapping = stat

        List<BusinessService> businessServices = businessServiceRepository.getAllBusinessService();
        List<String> actionableStatuses = util.getActionableStatusesForRole(requestInfo,businessServices,criteria);
        criteria.setAssignee(requestInfo.getUserInfo().getUuid());
        criteria.setStatus(actionableStatuses);*/

        util.enrichStatusesInSearchCriteria(requestInfo, criteria);
        criteria.setAssignee(requestInfo.getUserInfo().getUuid());


    }


}