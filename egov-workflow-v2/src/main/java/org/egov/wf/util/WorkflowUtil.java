package org.egov.wf.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.request.Role;
import org.egov.common.contract.request.User;
import org.egov.wf.config.WorkflowConfig;
import org.egov.wf.web.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.util.*;


@Component
public class WorkflowUtil {

    private ObjectMapper mapper;

    private WorkflowConfig config;


    @Autowired
    public WorkflowUtil(ObjectMapper mapper,WorkflowConfig config) {
        this.mapper = mapper;
        this.config = config;
    }

    /**
     * Method to return auditDetails for create/update flows
     * @param by The uuid of the user sending the request
     * @param isCreate Flag to determine if the call is for create or update
     * @return AuditDetails The auditdetails of the request
     */
    public AuditDetails getAuditDetails(String by, Boolean isCreate) {
        Long time = System.currentTimeMillis();
        if(isCreate)
            return AuditDetails.builder().createdBy(by).lastModifiedBy(by).createdTime(time).lastModifiedTime(time).build();
        else
            return AuditDetails.builder().lastModifiedBy(by).lastModifiedTime(time).build();
    }


    /**
     * Checks if the user has role allowed for the action
     * @param userRoles The roles available with the user
     * @param actionRoles The roles for which action is allowed
     * @return True if user can perform the action else false
     */
    public Boolean isRoleAvailable(String tenantId,List<Role> userRoles, List<String> actionRoles){
        Boolean flag = false;
 //       List<String> allowedRoles = Arrays.asList(actionRoles.get(0).split(","));
        if(CollectionUtils.isEmpty(userRoles))
            return false;
        for(Role role : userRoles) {
            if(isTenantIdValid(role.getTenantId(),tenantId)){
                if (actionRoles.contains(role.getCode()) || actionRoles.contains("*")) {
                    flag = true;
                    break;
                }
            }
        }
        return flag;
    }


    /**
     * Checks if the user has role allowed for the action
     * @param userRoles The roles available with the user
     * @param actionRoles The roles for which action is allowed
     * @return True if user can perform the action else false
     */
    public Boolean isRoleAvailable(List<String> userRoles, List<String> actionRoles){
        Boolean flag = false;
        //       List<String> allowedRoles = Arrays.asList(actionRoles.get(0).split(","));
        if(CollectionUtils.isEmpty(userRoles))
            return false;

        for(String role : userRoles) {
            if (actionRoles.contains(role) || actionRoles.contains("*")) {
                flag = true;
                break;
            }
        }
        return flag;
    }

    /**
     *  Fetches roles of all the actions in the businessService
     * @return All roles in the business service
     */
    public List<String> rolesAllowedInService(BusinessService businessService){
        List<String> roles = new LinkedList<>();
        businessService.getStates().forEach(state -> {
            if(!CollectionUtils.isEmpty(state.getActions())){
                state.getActions().forEach(action -> {
                    roles.addAll(action.getRoles());
                });
            }
        });
        return roles;
    }



    /**
     * Creates a map of status to roles who can take actions on it for all businessService
     * @param businessServices The list of businessServices
     * @return Map of status to roles which can take action on it for all businessService
     */
    public Map<String,Set<String>> getStateToRoleMap(List<BusinessService> businessServices){
        Map<String,Set<String>> stateToRolesMap = new HashMap<>();
        businessServices.forEach(businessService -> {
            for(State state : businessService.getStates()){
                HashSet<String> roles = new HashSet<>();
                if(!CollectionUtils.isEmpty(state.getActions())){
                    state.getActions().forEach(action -> {
                        roles.addAll(action.getRoles());
                    });
                }
                stateToRolesMap.put(state.getUuid(),roles);
            }
        });
        return stateToRolesMap;
    }


    /**
     * Gets the map of tenantId to roles the user is assigned
     * @param requestInfo RequestInfo of the request
     * @return Map of tenantId to roles for user in the requestInfo
     */
    public Map<String,List<String>> getTenantIdToUserRolesMap(RequestInfo requestInfo){
        Map<String,List<String>> tenantIdToUserRoles = new HashMap<>();
        requestInfo.getUserInfo().getRoles().forEach(role -> {
            if(tenantIdToUserRoles.containsKey(role.getTenantId())){
                tenantIdToUserRoles.get(role.getTenantId()).add(role.getCode());
            }
            else {
                List<String> roleCodes = new LinkedList<>();
                roleCodes.add(role.getCode());
                tenantIdToUserRoles.put(role.getTenantId(),roleCodes);
            }

        });
        return tenantIdToUserRoles;
    }


    /**
     * Gets the list of status on which user from requestInfo can take action upon
     * @param requestInfo The RequestInfo Object of the request
     * @param businessServices List of all businessServices
     * @return List of status on which user from requestInfo can take action upon
     */

    public List<String> getActionableStatusesForRole(RequestInfo requestInfo, List<BusinessService> businessServices,ProcessInstanceSearchCriteria criteria){

        String tenantId;
        List<String> userRoleCodes;
        Map<String,List<String>> tenantIdToUserRolesMap = getTenantIdToUserRolesMap(requestInfo);
        Map<String,List<BusinessService>> tenantIdToBuisnessSevicesMap =  getTenantIdToBuisnessSevicesMap(businessServices);
        Map<String,Set<String>> stateToRoleMap = getStateToRoleMap(businessServices);
        List<String> actionableStatuses = new LinkedList<>();
        
        for(Map.Entry<String,List<String>> entry : tenantIdToUserRolesMap.entrySet()){
            if(entry.getKey().equals(criteria.getTenantId())){
                List<BusinessService> businessServicesByTenantId = new ArrayList();
                if(config.getIsStateLevel()){
                    businessServicesByTenantId = tenantIdToBuisnessSevicesMap.get(entry.getKey().split("\\.")[0]);
                }else{
                    businessServicesByTenantId = tenantIdToBuisnessSevicesMap.get(entry.getKey());
                }
                if(businessServicesByTenantId != null ) {
                	 businessServicesByTenantId.forEach(service -> {
                         List<State> states = service.getStates();
                         states.forEach(state -> {
                             Set<String> stateRoles = stateToRoleMap.get(state.getUuid());
                             if(!CollectionUtils.isEmpty(stateRoles) && !Collections.disjoint(stateRoles,entry.getValue())){
                                 actionableStatuses.add(entry.getKey() + ':' + state.getUuid());
                             }

                         });
                     });
                }
               
            }         
        }
        return actionableStatuses;
    }
    
     
     
//    public List<String> getActionableStatusesForRole(RequestInfo requestInfo, List<BusinessService> businessServices){
//
//        String tenantId;
//        List<String> userRoleCodes;
//        Map<String,String> stateUuidToTenantIdMap = getStateUuidToTenantIdMap(businessServices);
//        Map<String,List<String>> tenantIdToUserRolesMap = getTenantIdToUserRolesMap(requestInfo);
//        Map<String,Set<String>> stateToRoleMap = getStateToRoleMap(businessServices);
//        List<String> actionableStatuses = new LinkedList<>();
//
//        for(Map.Entry<String,Set<String>> entry : stateToRoleMap.entrySet()){
//            tenantId = stateUuidToTenantIdMap.get(entry.getKey());
//            userRoleCodes = tenantIdToUserRolesMap.get(tenantId);
//            if(CollectionUtils.isEmpty(userRoleCodes)){
//                userRoleCodes = tenantIdToUserRolesMap.get(tenantId.split("\\.")[0]);
//            }
//            if(!CollectionUtils.isEmpty(userRoleCodes) && !Collections.disjoint(userRoleCodes,entry.getValue())){
//                actionableStatuses.add(entry.getKey());
//            }
//        }
//        return actionableStatuses;
//    }


    /**
     * Extracts all the roles from the state
     * @param state The state whose roles has to be extracted
     * @return Roles availaable in the states which can take action
     */
    public List<String> getAllRolesFromState(State state){
        List<Action> actions = state.getActions();
        List<String> rolesInState = new LinkedList<>();
        if(!CollectionUtils.isEmpty(actions)){
            actions.forEach(action -> {
                rolesInState.addAll(action.getRoles());
            });
        }
        return rolesInState;
    }


    /**
     * Extracts unique businessIds from list of ProcessStateAndAction
     * @param processStateAndActions List of ProcessStateAndAction whose businessIds are to be fetched
     * @return list of businessId
     */
    public Set<String> getBusinessIds(List<ProcessStateAndAction> processStateAndActions){
        Set<String> businessIds = new HashSet<>();
        if(CollectionUtils.isEmpty(processStateAndActions))
            return businessIds;
        processStateAndActions.forEach(processStateAndAction -> {
            businessIds.add(processStateAndAction.getProcessInstanceFromRequest().getBusinessId());
        });
        return businessIds;
    }

    /**
     * Fetches the latest processStateAndAction for the given businessId
     * @param businessId The businessId whose latest record has to be fetched
     * @param processStateAndActions The list of processStateAndAction
     * @return The lastest processStateAndAction for the given businessId
     */
    public ProcessStateAndAction getLatestProcessStateAndAction(String businessId,List<ProcessStateAndAction> processStateAndActions){
        Long maxTime = 0l;
        ProcessStateAndAction latestProcessStateAndAction = null;
        for(ProcessStateAndAction processStateAndAction:processStateAndActions) {
            if(processStateAndAction.getProcessInstanceFromRequest().getBusinessId().equalsIgnoreCase(businessId)
                    && maxTime<processStateAndAction.getProcessInstanceFromRequest().getAuditDetails().getLastModifiedTime()){
                latestProcessStateAndAction = processStateAndAction;
                maxTime = processStateAndAction.getProcessInstanceFromRequest().getAuditDetails().getLastModifiedTime();
            }
        }
        return latestProcessStateAndAction;
    }


    /**
     * Returns the list of tenantId for which the user has roles
     * @param user The user whose role tenantIds are to be fetched
     * @return
     */
    public List<String> getTenantIds(User user){
        Set<String> tenantIds = new HashSet<>();
        user.getRoles().forEach(role -> {
            tenantIds.add(role.getTenantId());
        });
        return new LinkedList<>(tenantIds);
    }


    public Map<String,List<BusinessService>> getTenantIdToBuisnessSevicesMap(List<BusinessService> businessServices){
        Map<String,List<BusinessService>> tenantIdToBuisnessSevicesMap = new HashMap<>();
        businessServices.forEach(businessService -> {
            if(tenantIdToBuisnessSevicesMap.containsKey(businessService.getTenantId())){
                tenantIdToBuisnessSevicesMap.get(businessService.getTenantId()).add(businessService);
            }
            else {
                List<BusinessService> businessServiceList = new LinkedList<>();
                businessServiceList.add(businessService);
                tenantIdToBuisnessSevicesMap.put(businessService.getTenantId(),businessServiceList);
            }
        });
        return tenantIdToBuisnessSevicesMap;
    }


    public Map<String,String> getStateUuidToTenantIdMap(List<BusinessService> businessServices){
        Map<String,String> stateUuidToTenantIdMap = new HashMap<>();
        businessServices.forEach(businessService -> {
            businessService.getStates().forEach(state -> {
                stateUuidToTenantIdMap.put(state.getUuid(),state.getTenantId());
            });
        });
        return stateUuidToTenantIdMap;
    }


    /**
     *  Checks if the tenantId is valid to take action
     * @param roleTenantId The tenantId of the role
     * @param applicationTeanantId The tenantId of the application
     * @return
     */
    private Boolean isTenantIdValid(String roleTenantId, String applicationTeanantId){

        if(roleTenantId == null)
            return false;

        Boolean isTenantIdValid = false;

        // If the tenantId are same role can take action
        if(roleTenantId.equalsIgnoreCase(applicationTeanantId))
            isTenantIdValid = true;

        // If the role tenantId is statelevel it can take action
        else if(roleTenantId.equalsIgnoreCase(applicationTeanantId.split("\\.")[0]))
            isTenantIdValid = true;

        return isTenantIdValid;

    }















}
