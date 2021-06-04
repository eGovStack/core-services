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

    /**
     * Enriches processInstance search criteria based on requestInfo
     * @param requestInfo
     * @param criteria
     */
    private void enrichSearchCriteriaFromUser(RequestInfo requestInfo,ProcessInstanceSearchCriteria criteria){

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


    public List<ProcessInstance> escalatedApplicationsSearch(RequestInfo requestInfo, ProcessInstanceSearchCriteria criteria) {
        List<String> escalatedApplicationsBusinessIds;
        List<ProcessInstance> escalatedApplications = new ArrayList<>();
        Set<String> autoEscalationEmployeesUuids = enrichmentService.enrichUuidsOfAutoEscalationEmployees(requestInfo, criteria);
        enrichmentService.enrichStatesToIgnore(requestInfo, criteria);
        escalatedApplicationsBusinessIds = workflowRepository.fetchEscalatedApplicationsBusinessIdsFromDb(criteria);
        if(CollectionUtils.isEmpty(escalatedApplicationsBusinessIds)){
            return escalatedApplications;
        }
        // SEARCH BASED ON FILTERED BUSINESS IDs DONE HERE
        ProcessInstanceSearchCriteria searchCriteria =  new ProcessInstanceSearchCriteria();
        searchCriteria.setBusinessIds(escalatedApplicationsBusinessIds);
        searchCriteria.setTenantId(criteria.getTenantId());
        searchCriteria.setHistory(true);
        List<ProcessInstance> escalatedApplicationsWithHistory = search(requestInfo, searchCriteria);

        // Only last but one applications in history needs to show up where the employee failed to take action

        HashMap<String, List<ProcessInstance>> businessIdsVsProcessInstancesMap = new HashMap<>();
        HashMap<String, Integer> occurenceMap = new HashMap<>();
        for(ProcessInstance processInstance : escalatedApplicationsWithHistory){
            if(businessIdsVsProcessInstancesMap.containsKey(processInstance.getBusinessId())){
                occurenceMap.put(processInstance.getBusinessId(), occurenceMap.get(processInstance.getBusinessId()) + 1);
                businessIdsVsProcessInstancesMap.get(processInstance.getBusinessId()).add(processInstance);
            }else{
                occurenceMap.put(processInstance.getBusinessId(), 1);
                List<ProcessInstance> processInstanceList = new ArrayList<>();
                processInstanceList.add(processInstance);
                businessIdsVsProcessInstancesMap.put(processInstance.getBusinessId(), processInstanceList);
            }
        }
        criteria.setAssignee(requestInfo.getUserInfo().getUuid());
        for(String businessId : occurenceMap.keySet()){
            if(occurenceMap.get(businessId) >= 2){
                if(autoEscalationEmployeesUuids.contains(businessIdsVsProcessInstancesMap.get(businessId).get(0).getAuditDetails().getCreatedBy()) && businessIdsVsProcessInstancesMap.get(businessId).get(1).getAuditDetails().getCreatedBy().equals(criteria.getAssignee())){
                    escalatedApplications.add(businessIdsVsProcessInstancesMap.get(businessId).get(0));
                }
            }
        }
        return escalatedApplications;
    }
}
