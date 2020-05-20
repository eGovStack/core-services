package org.egov.pg.models;

import java.util.List;

import org.egov.common.contract.response.ResponseInfo;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Setter
@Getter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BankBranch {
    private Long id;

    @JsonProperty("Bank")
    private Bank bank;

    private String code;

    private String name;

    private String address;

    private String address2;

    private String city;

    private String state;

    private String pincode;

    private String phone;

    private String fax;

    private String contactPerson;

    private Boolean active;

    private String description;

    private String micr;

}

