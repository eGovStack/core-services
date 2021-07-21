package org.egov.wf.web.models;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
public class ProcessInstanceSearchCriteria {

    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("status")
    private List<String> status;

    @JsonProperty("businessIds")
    private List<String> businessIds;

    @JsonProperty("assignee")
    private String  assignee;

    @JsonProperty("ids")
    private List<String> ids;

    @JsonProperty("history")
    private Boolean history = false;

    @JsonProperty("fromDate")
    private Long fromDate = null;

    @JsonProperty("toDate")
    private Long toDate = null;


    @JsonProperty("offset")
    private Integer offset;

    @JsonProperty("limit")
    private Integer limit;

    @JsonProperty("businessService")
    private String businessService;

    @JsonProperty("moduleName")
    private String moduleName;

    @JsonIgnore
    private List<String> tenantSpecifiStatus;

    @JsonIgnore
    private List<String> multipleAssignees;

    @JsonIgnore
    private List<String> statesToIgnore;

    @JsonIgnore
    @Builder.Default
    private Boolean isStatusCountCall = false;




    public Boolean isNull(){
        if(this.getBusinessIds()==null && this.getIds()==null && this.getAssignee()==null &&
                this.getStatus()==null) {
            if(this.getIsStatusCountCall()){
                if(this.getBusinessService() != null){
                    return false;
                }
            }
            return true;
        }
        else return false;
    }



}
