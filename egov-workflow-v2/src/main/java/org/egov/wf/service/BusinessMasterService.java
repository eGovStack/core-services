package org.egov.wf.service;

import org.egov.wf.config.WorkflowConfig;
import org.egov.wf.producer.Producer;
import org.egov.wf.repository.BusinessServiceRepository;
import org.egov.wf.web.models.BusinessService;
import org.egov.wf.web.models.BusinessServiceRequest;
import org.egov.wf.web.models.BusinessServiceSearchCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;


@Service
public class BusinessMasterService {

    private Producer producer;

    private WorkflowConfig config;

    private EnrichmentService enrichmentService;

    private BusinessServiceRepository repository;

    private Map<String, String> businessServicetoIsStateLevel;


    @Autowired
    public BusinessMasterService(Producer producer, WorkflowConfig config, EnrichmentService enrichmentService,
                                 BusinessServiceRepository repository,Map<String, String> businessServicetoIsStateLevel) {
        this.producer = producer;
        this.config = config;
        this.enrichmentService = enrichmentService;
        this.repository = repository;
        this.businessServicetoIsStateLevel = businessServicetoIsStateLevel;
    }




    /**
     * Enriches and sends the request on kafka to persist
     * @param request The BusinessServiceRequest to be persisted
     * @return The enriched object which is persisted
     */
    @CacheEvict("businessService")
    public List<BusinessService> create(BusinessServiceRequest request){
       enrichmentService.enrichCreateBusinessService(request);
       producer.push(config.getSaveBusinessServiceTopic(),request);
       return request.getBusinessServices();
    }


    /**
     * Fetches business service object from db
     * @param *criteria The search criteria
     * @return Data fetched from db
     */
    @Cacheable(value = "businessService")
    public List<BusinessService> search(BusinessServiceSearchCriteria criteria){
        String tenantId = criteria.getTenantIds().get(0);
        Boolean isStateLevel = true;
        List<BusinessService> businessServices = repository.getBusinessServices(criteria,isStateLevel);
        if(businessServicetoIsStateLevel.containsValue(isStateLevel))
        {
            String updatedtenantId = new String();
            for(int i=0;i<tenantId.length();i++)
            {
                if(tenantId.charAt(i)!='.')
                    updatedtenantId += tenantId;
                else
                    break;
            }
            enrichmentService.enrichTenantIdForStateLevel(updatedtenantId,businessServices);
        }
        else{
            enrichmentService.enrichTenantIdForStateLevel(tenantId,businessServices);
        }
        return businessServices;
    }

    @CacheEvict("businessService")
    public List<BusinessService> update(BusinessServiceRequest request){
        enrichmentService.enrichUpdateBusinessService(request);
        producer.push(config.getUpdateBusinessServiceTopic(),request);
        return request.getBusinessServices();
    }



}
