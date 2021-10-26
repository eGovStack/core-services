package org.egov.wf.service;

import com.jayway.jsonpath.JsonPath;
import org.egov.common.contract.request.RequestInfo;
import org.egov.mdms.model.MasterDetail;
import org.egov.mdms.model.MdmsCriteria;
import org.egov.mdms.model.MdmsCriteriaReq;
import org.egov.mdms.model.ModuleDetail;
import org.egov.wf.config.WorkflowConfig;
import org.egov.wf.repository.ServiceRequestRepository;
import org.egov.wf.util.WorkflowConstantsV2;
import org.egov.wf.web.models.ProcessInstanceRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;

import java.util.*;

import static org.egov.wf.util.WorkflowConstantsV2.*;

@Service
public class MDMSServiceV2 {

   private WorkflowConfig config;

   private ServiceRequestRepository serviceRequestRepository;

   private WorkflowConfig workflowConfig;

   private Map<String,Boolean> stateLevelMapping;
   

    @Autowired
    public MDMSServiceV2(WorkflowConfig config, ServiceRequestRepository serviceRequestRepository, WorkflowConfig workflowConfig) {
        this.config = config;
        this.serviceRequestRepository = serviceRequestRepository;
        this.workflowConfig = workflowConfig;
    }


    public Map<String, Boolean> getStateLevelMapping() {
        return this.stateLevelMapping;
    }


    @Bean
    public void stateLevelMapping(){
        Map<String, Boolean> stateLevelMapping = new HashMap<>();

        Object mdmsData = getBusinessServiceMDMS();
        List<HashMap<String, Object>> configs = JsonPath.read(mdmsData,JSONPATH_BUSINESSSERVICE_STATELEVEL);


        for (Map map : configs){

            String businessService = (String) map.get("businessService");
            Boolean isStatelevel = Boolean.valueOf((String) map.get("isStatelevel"));

            stateLevelMapping.put(businessService, isStatelevel);
        }

        this.stateLevelMapping = stateLevelMapping;
    }


    /**
     * Calls MDMS service to fetch master data
     * @param requestInfo
     * @return
     */
    public Object mDMSCall(RequestInfo requestInfo){
        MdmsCriteriaReq mdmsCriteriaReq = getMDMSRequest(requestInfo,workflowConfig.getStateLevelTenantId());
        Object result = serviceRequestRepository.fetchResult(getMdmsSearchUrl(), mdmsCriteriaReq);
        return result;
    }

    /**
     * Calls MDMS service to fetch master data
     * @return
     */
    public Object getBusinessServiceMDMS(){
        MdmsCriteriaReq mdmsCriteriaReq = getBusinessServiceMDMSRequest(new RequestInfo(), workflowConfig.getStateLevelTenantId());
        Object result = serviceRequestRepository.fetchResult(getMdmsSearchUrl(), mdmsCriteriaReq);
        return result;
    }


    /**
     * Creates MDMSCriteria
     * @param requestInfo The RequestInfo of the request
     * @param tenantId TenantId of the request
     * @return MDMSCriteria for search call
     */
    private MdmsCriteriaReq getMDMSRequest(RequestInfo requestInfo, String tenantId){
        ModuleDetail wfModuleDetail = getWorkflowMDMSDetail();

        MdmsCriteria mdmsCriteria = MdmsCriteria.builder().moduleDetails(Collections.singletonList(wfModuleDetail))
                .tenantId(tenantId)
                .build();

        MdmsCriteriaReq mdmsCriteriaReq = MdmsCriteriaReq.builder().mdmsCriteria(mdmsCriteria)
                .requestInfo(requestInfo).build();
        return mdmsCriteriaReq;
    }


    /**
     * Creates MDMS ModuleDetail object for workflow
     * @return ModuleDetail for workflow
     */
    private ModuleDetail getWorkflowMDMSDetail() {

        // master details for WF module
        List<MasterDetail> wfMasterDetails = new ArrayList<>();

        wfMasterDetails.add(MasterDetail.builder().name(MDMS_BUSINESSSERVICE).build());

        ModuleDetail wfModuleDtls = ModuleDetail.builder().masterDetails(wfMasterDetails)
                .moduleName(MDMS_WORKFLOW).build();

        return wfModuleDtls;
    }

    /**
     * Creates MDMSCriteria
     * @param requestInfo The RequestInfo of the request
     * @param tenantId TenantId of the request
     * @return MDMSCriteria for search call
     */
    private MdmsCriteriaReq getBusinessServiceMDMSRequest(RequestInfo requestInfo, String tenantId){
        ModuleDetail wfMasterDetails = getBusinessServiceMasterConfig();


        MdmsCriteria mdmsCriteria = MdmsCriteria.builder().moduleDetails(Collections.singletonList(wfMasterDetails))
                .tenantId(tenantId)
                .build();

        MdmsCriteriaReq mdmsCriteriaReq = MdmsCriteriaReq.builder().mdmsCriteria(mdmsCriteria)
                .requestInfo(requestInfo).build();
        return mdmsCriteriaReq;
    }


    /**
     * Fetches BusinessServiceMasterConfig from MDMS
     * @return ModuleDetail for workflow
     */
    private ModuleDetail getBusinessServiceMasterConfig() {

        // master details for WF module
        List<MasterDetail> wfMasterDetails = new ArrayList<>();

        wfMasterDetails.add(MasterDetail.builder().name(MDMS_BUSINESSSERVICE).build());

        ModuleDetail wfModuleDtls = ModuleDetail.builder().masterDetails(wfMasterDetails)
                .moduleName(MDMS_WORKFLOW).build();

        return wfModuleDtls;
    }




    /**
     * Returns the url for mdms search endpoint
     * @return url for mdms search endpoint
     */
    public StringBuilder getMdmsSearchUrl() {
        return new StringBuilder().append(config.getMdmsHost()).append(config.getMdmsEndPoint());
    }







}