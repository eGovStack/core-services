package org.egov.user.domain.model;

import lombok.*;
import lombok.Builder;
import lombok.experimental.*;
import org.egov.user.config.*;
import org.egov.user.domain.model.enums.*;
import org.hibernate.validator.constraints.*;

import javax.validation.constraints.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class Citizen {
    protected Long id;
    protected String uuid;

    @Pattern(regexp = UserServiceConstants.PATTERN_TENANT)
    @Size(max = 50)
    protected String tenantId;
    protected String userName;

    protected String fatherOrHusbandName;

    protected GuardianRelation relationship;
    protected String name;
    protected String gender;
    protected String mobileNumber;

    @Email
    protected String emailId;


}