
package org.egov.wf.util;

import org.egov.tracer.model.CustomException;
import org.egov.wf.repository.BusinessServiceRepositoryV2;
import org.egov.wf.web.models.BusinessService;
import org.egov.wf.web.models.BusinessServiceSearchCriteriaV2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.util.Collections;
import java.util.List;

@Component
public class BusinessUtilV2 {

    private BusinessServiceRepositoryV2 businessServiceRepository;

    @Autowired
    public BusinessUtilV2(BusinessServiceRepositoryV2 businessServiceRepository) {
        this.businessServiceRepository = businessServiceRepository;
    }

    /**
     * Searches for businessService for the given list of processStateAndActions
     * @param tenantId The tenantId of the BusinessService
     * @param businessService The businessService code of the businessService
     * @return BusinessService
     */
    public BusinessService getBusinessService(String tenantId,String businessService){
        BusinessServiceSearchCriteriaV2 criteria = new BusinessServiceSearchCriteriaV2();
        criteria.setTenantId(tenantId);
        criteria.setBusinessServices(Collections.singletonList(businessService));
        List<BusinessService> businessServices = businessServiceRepository.getBusinessServices(criteria);
        if(CollectionUtils.isEmpty(businessServices))
            throw new CustomException("INVALID REQUEST","No BusinessService found for businessService: "+criteria.getBusinessServices());
        return businessServices.get(0);
    }

}