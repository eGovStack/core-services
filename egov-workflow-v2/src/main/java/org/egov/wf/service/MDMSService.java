package org.egov.wf.service;

import org.egov.mdms.model.MasterDetail;
import org.egov.mdms.model.MdmsCriteria;
import org.egov.mdms.model.MdmsCriteriaReq;
import org.egov.mdms.model.ModuleDetail;
import org.egov.wf.config.WorkflowConfig;
import org.egov.wf.repository.ServiceRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.*;

import static org.egov.wf.util.WorkflowConstants.*;

@Component
public class MDMSService {


    private WorkflowConfig config;

    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    public MDMSService(WorkflowConfig config, ServiceRequestRepository serviceRequestRepository) {
        this.config = config;
        this.serviceRequestRepository = serviceRequestRepository;
    }
    /**
     * Calls MDMS service to fetch wf master data
     * @param *request
     * @return
     */
    public Object mDMSCall(){
        String tenantId = config.getTenantId();
        MdmsCriteriaReq mdmsCriteriaReq = getMDMSRequest(tenantId);
        Object result = serviceRequestRepository.fetchResult(getMdmsSearchUrl(), mdmsCriteriaReq);
        return result;
    }

    /**
     * Returns mdms search criteria based on the tenantId
     * @param *requestInfo
     * @param tenantId
     * @return
     */
    public MdmsCriteriaReq getMDMSRequest(String tenantId){
        List<ModuleDetail> wfModuleRequest = getWFModuleRequest();

        List<ModuleDetail> moduleDetails = new LinkedList<>();
        moduleDetails.addAll(wfModuleRequest);

        MdmsCriteria mdmsCriteria = MdmsCriteria.builder().moduleDetails(moduleDetails).tenantId(tenantId)
                .build();

        MdmsCriteriaReq mdmsCriteriaReq = MdmsCriteriaReq.builder().mdmsCriteria(mdmsCriteria).build();
        return mdmsCriteriaReq;
    }
    /**
     * Creates request to search serviceDef from MDMS
     * @return request to search UOM from MDMS
     */
    private List<ModuleDetail> getWFModuleRequest() {


        List<MasterDetail> wfMasterDetails = new ArrayList<>();


        final String filterCode = "$.[?(@.active==true)]";

        wfMasterDetails.add(MasterDetail.builder().name(MDMS_BUSINESSSERVICEMASTERCONFIG).filter(filterCode).build());

        ModuleDetail wfModuleDtls = ModuleDetail.builder().masterDetails(wfMasterDetails)
                .moduleName(MDMS_HOST_NAME).build();


        return Collections.singletonList(wfModuleDtls);

    }
    /**
     * Returns the url for mdms search endpoint
     *
     * @return url for mdms search endpoint
     */
    public StringBuilder getMdmsSearchUrl() {
        return new StringBuilder().append(config.getMdmsHost()).append(config.getMdmsEndPoint());
    }
}

