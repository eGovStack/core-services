package org.egov.wf.service;

import org.egov.common.contract.request.RequestInfo;
import org.egov.wf.config.WorkflowConfig;
import org.egov.wf.repository.BusinessServiceRepository;
import org.egov.wf.repository.WorKflowRepository;
import org.egov.wf.util.WorkflowUtil;
import org.egov.wf.validator.WorkflowValidator;
import org.egov.wf.web.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.*;


@Service
public class WorkflowService {

    private WorkflowConfig config;

    private TransitionService transitionService;

    private EnrichmentService enrichmentService;

    private WorkflowValidator workflowValidator;

    private StatusUpdateService statusUpdateService;

    private WorKflowRepository workflowRepository;

    private WorkflowUtil util;

    private BusinessServiceRepository businessServiceRepository;


    @Autowired
    public WorkflowService(WorkflowConfig config, TransitionService transitionService,
                           EnrichmentService enrichmentService, WorkflowValidator workflowValidator,
                           StatusUpdateService statusUpdateService, WorKflowRepository workflowRepository,
                           WorkflowUtil util,BusinessServiceRepository businessServiceRepository) {
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
    public List<ProcessInstance> search(RequestInfo requestInfo,ProcessInstanceSearchCriteria criteria){
        List<ProcessInstance> processInstances;
        if(criteria.isNull())
            processInstances = getUserBasedProcessInstances(requestInfo,criteria);
        else processInstances = workflowRepository.getProcessInstances(criteria);
        if(CollectionUtils.isEmpty(processInstances))
            return processInstances;

        enrichmentService.enrichUsersFromSearch(requestInfo,processInstances);
        List<ProcessStateAndAction> processStateAndActions = enrichmentService.enrichNextActionForSearch(requestInfo,processInstances);
    //    workflowValidator.validateSearch(requestInfo,processStateAndActions);
        enrichmentService.enrichAndUpdateSlaForSearch(processInstances);
        return processInstances;
    }


    public Integer count(RequestInfo requestInfo,ProcessInstanceSearchCriteria criteria){
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
                                       ProcessInstanceSearchCriteria criteria){

        enrichSearchCriteriaFromUser(requestInfo, criteria);
        List<ProcessInstance> processInstances = workflowRepository.getProcessInstancesForUserInbox(criteria);
        return processInstances;

        /*
        List<ProcessInstance> processInstancesForAssignee = workflowRepository.getProcessInstancesForAssignee(criteria);
        List<ProcessInstance> processInstancesForStatus = new LinkedList<>();
        if(!config.getAssignedOnly())
            processInstancesForStatus = workflowRepository.getProcessInstancesForStatus(criteria);
        Set<ProcessInstance> processInstanceSet = new LinkedHashSet<>(processInstancesForStatus);
        processInstanceSet.addAll(processInstancesForAssignee);
        return new LinkedList<>(processInstanceSet);*/
    }


    /**
     * Enriches processInstance search criteria based on requestInfo
     * @param requestInfo
     * @param criteria
     */
    private void enrichSearchCriteriaFromUser(RequestInfo requestInfo,ProcessInstanceSearchCriteria criteria){

        BusinessServiceSearchCriteria businessServiceSearchCriteria = new BusinessServiceSearchCriteria();

        /*
         * If tenantId is sent in query param processInstances only for that tenantId is returned
         * else all tenantIds for which the user has roles are returned
         * */
        if(criteria.getTenantId()!=null)
            businessServiceSearchCriteria.setTenantIds(Collections.singletonList(criteria.getTenantId()));
        else
            businessServiceSearchCriteria.setTenantIds(util.getTenantIds(requestInfo.getUserInfo()));

        List<BusinessService> businessServices = businessServiceRepository.getBusinessServices(businessServiceSearchCriteria);
        List<String> actionableStatuses = util.getActionableStatusesForRole(requestInfo,businessServices,criteria);
        criteria.setAssignee(requestInfo.getUserInfo().getUuid());
        criteria.setStatus(actionableStatuses);

    }









}
