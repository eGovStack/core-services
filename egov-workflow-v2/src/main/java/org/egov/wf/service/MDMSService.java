package org.egov.wf.service;

import org.egov.common.contract.request.RequestInfo;
import org.egov.mdms.model.MasterDetail;
import org.egov.mdms.model.MdmsCriteria;
import org.egov.mdms.model.MdmsCriteriaReq;
import org.egov.mdms.model.ModuleDetail;
import org.egov.wf.config.WorkflowConfig;
import org.egov.wf.repository.ServiceRequestRepository;
import org.egov.wf.util.WorkflowConstants;
import org.egov.wf.web.models.ProcessInstanceRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

import static org.egov.wf.util.WorkflowConstants.*;

@Service
public class MDMSService {

   private WorkflowConfig config;

   private ServiceRequestRepository serviceRequestRepository;

   private WorkflowConfig workflowConfig;


    @Autowired
    public MDMSService(WorkflowConfig config, ServiceRequestRepository serviceRequestRepository, WorkflowConfig workflowConfig) {
        this.config = config;
        this.serviceRequestRepository = serviceRequestRepository;
        this.workflowConfig = workflowConfig;
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
     * Creates MDMSCriteria
     * @param requestInfo The RequestInfo of the request
     * @param tenantId TenantId of the request
     * @return MDMSCriteria for search call
     */
    private MdmsCriteriaReq getMDMSRequest(RequestInfo requestInfo, String tenantId){
        ModuleDetail escalationDetail = getAutoEscalationConfig();
        ModuleDetail tenantDetail = getTenants();

        List<ModuleDetail> moduleDetails = new LinkedList<>(Arrays.asList(escalationDetail,tenantDetail));

        MdmsCriteria mdmsCriteria = MdmsCriteria.builder().moduleDetails(moduleDetails)
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
     * Creates MDMS ModuleDetail object for AutoEscalation
     * @return ModuleDetail for AutoEscalation
     */
    private ModuleDetail getAutoEscalationConfig() {

        // master details for WF module
        List<MasterDetail> masterDetails = new ArrayList<>();

        masterDetails.add(MasterDetail.builder().name(MDMS_AUTOESCALTION).build());

        ModuleDetail wfModuleDtls = ModuleDetail.builder().masterDetails(masterDetails)
                .moduleName(MDMS_WORKFLOW).build();

        return wfModuleDtls;
    }

    /**
     * Creates MDMS ModuleDetail object for tenants
     * @return ModuleDetail for tenants
     */
    private ModuleDetail getTenants() {

        // master details for WF module
        List<MasterDetail> masterDetails = new ArrayList<>();

        masterDetails.add(MasterDetail.builder().name(MDMS_TENANTS).build());

        ModuleDetail wfModuleDtls = ModuleDetail.builder().masterDetails(masterDetails)
                .moduleName(MDMS_MODULE_TENANT).build();

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
