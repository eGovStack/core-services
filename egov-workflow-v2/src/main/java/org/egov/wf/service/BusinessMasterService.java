package org.egov.wf.service;

import com.jayway.jsonpath.JsonPath;
import org.egov.wf.config.WorkflowConfig;
import org.egov.wf.producer.Producer;
import org.egov.wf.repository.BusinessServiceRepository;
import org.egov.wf.web.models.BusinessService;
import org.egov.wf.web.models.BusinessServiceRequest;
import org.egov.wf.web.models.BusinessServiceSearchCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.egov.wf.util.WorkflowConstants.JSONPATH_BUSINESSSERVICE_STATELEVEL;

@Service
public class BusinessMasterService {

    private Producer producer;

    private WorkflowConfig config;

    private EnrichmentService enrichmentService;

    private BusinessServiceRepository repository;

    private MDMSService mdmsService;


    @Autowired
    public BusinessMasterService(Producer producer, WorkflowConfig config, EnrichmentService enrichmentService,
                                 BusinessServiceRepository repository, MDMSService mdmsService) {
        this.producer = producer;
        this.config = config;
        this.enrichmentService = enrichmentService;
        this.repository = repository;
        this.mdmsService = mdmsService;
    }




    /**
     * Enriches and sends the request on kafka to persist
     * @param request The BusinessServiceRequest to be persisted
     * @return The enriched object which is persisted
     */
    @Caching(evict = {
            @CacheEvict("businessService"),
            @CacheEvict("roleTenantAndStatusesMapping")
    })
    public List<BusinessService> create(BusinessServiceRequest request){
       enrichmentService.enrichCreateBusinessService(request);
       producer.push(config.getSaveBusinessServiceTopic(),request);
       return request.getBusinessServices();
    }

    /**
     * Fetches business service object from db
     * @param criteria The search criteria
     * @return Data fetched from db
     */
    @Cacheable(value = "businessService")
    public List<BusinessService> search(BusinessServiceSearchCriteria criteria){
        String tenantId = criteria.getTenantId();
        List<BusinessService> businessServices = repository.getBusinessServices(criteria);
        enrichmentService.enrichTenantIdForStateLevel(tenantId,businessServices);

        return businessServices;
    }


    
    @Caching(evict = {
            @CacheEvict("businessService"),
            @CacheEvict("roleTenantAndStatusesMapping")
    })
    public List<BusinessService> update(BusinessServiceRequest request){
        enrichmentService.enrichUpdateBusinessService(request);
        producer.push(config.getUpdateBusinessServiceTopic(),request);
        return request.getBusinessServices();
    }



}
