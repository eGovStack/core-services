package org.egov.wf.service;

import com.jayway.jsonpath.JsonPath;
import org.egov.wf.config.WorkflowConfig;
import org.egov.wf.producer.Producer;

import org.egov.wf.repository.BusinessServiceRepositoryV2;
import org.egov.wf.web.models.BusinessService;
import org.egov.wf.web.models.BusinessServiceRequest;
import org.egov.wf.web.models.BusinessServiceSearchCriteriaV2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.egov.wf.util.WorkflowConstantsV2.JSONPATH_BUSINESSSERVICE_STATELEVEL;

@Service
public class BusinessMasterServiceV2 {

    private Producer producer;

    private WorkflowConfig config;

    private EnrichmentServiceV2 enrichmentServiceV2;

    private BusinessServiceRepositoryV2 repository;

    private MDMSServiceV2 mdmsServiceV2;

    private CacheManager cacheManager;

    @Autowired
    public BusinessMasterServiceV2(Producer producer, WorkflowConfig config, EnrichmentServiceV2 enrichmentServiceV2,
                                 BusinessServiceRepositoryV2 repository, MDMSServiceV2 mdmsServiceV2, CacheManager cacheManager) {
        this.producer = producer;
        this.config = config;
        this.enrichmentServiceV2 = enrichmentServiceV2;
        this.repository = repository;
        this.mdmsServiceV2 = mdmsServiceV2;
        this.cacheManager = cacheManager;
    }




    /**
     * Enriches and sends the request on kafka to persist
     * @param request The BusinessServiceRequest to be persisted
     * @return The enriched object which is persisted
     */
    public List<BusinessService> create(BusinessServiceRequest request){
        evictAllCacheValues("businessService");
        evictAllCacheValues("roleTenantAndStatusesMapping");
        enrichmentServiceV2.enrichCreateBusinessService(request);
        producer.push(config.getSaveBusinessServiceTopic(),request);
        return request.getBusinessServices();
    }

    /**
     * Fetches business service object from db
     * @param criteria The search criteria
     * @return Data fetched from db
     */
   
    public List<BusinessService> search(BusinessServiceSearchCriteriaV2 criteria){
        String tenantId = criteria.getTenantId();
        List<BusinessService> businessServices = repository.getBusinessServices(criteria);
        enrichmentServiceV2.enrichTenantIdForStateLevel(tenantId,businessServices);

        return businessServices;
    }



    public List<BusinessService> update(BusinessServiceRequest request){
      //  evictAllCacheValues("businessService");
      //  evictAllCacheValues("roleTenantAndStatusesMapping");
        enrichmentServiceV2.enrichUpdateBusinessService(request);
        producer.push(config.getUpdateBusinessServiceTopic(),request);
        return request.getBusinessServices();
    }


    private void evictAllCacheValues(String cacheName) {
        cacheManager.getCache(cacheName).clear();
    }



}