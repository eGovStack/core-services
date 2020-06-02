package org.egov.common.contract.request;

import com.fasterxml.jackson.annotation.*;
import lombok.*;
import org.egov.common.contract.request.*;
import org.egov.domain.model.*;
import org.hibernate.validator.constraints.*;

import javax.validation.*;
import javax.validation.constraints.*;
import java.util.*;
import java.util.stream.*;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class UpdateMessageRequest {
	@JsonProperty("RequestInfo")
	private RequestInfo requestInfo;
	@NotEmpty
	private String tenantId;
	@NotEmpty
	private String locale;
	@NotEmpty
	private String module;
	@Size(min = 1)
	@Valid
	private List<UpdateMessage> messages;

	public List<org.egov.domain.model.Message> toDomainMessages() {
		return messages.stream().map(message -> {
			final MessageIdentity messageIdentity = MessageIdentity.builder().code(message.getCode()).module(module)
					.locale(locale).tenant(getTenant()).build();
			return org.egov.domain.model.Message.builder().message(message.getMessage())
					.messageIdentity(messageIdentity).build();
		}).collect(Collectors.toList());
	}

	public Tenant getTenant() {
		return new Tenant(tenantId);
	}

	public AuthenticatedUser getAuthenticatedUser() {
		if (requestInfo == null || requestInfo.getUserInfo() == null || requestInfo.getUserInfo().getId() == null) {
			throw new NotAuthenticatedException();
		}
		return new AuthenticatedUser(requestInfo.getUserInfo().getId());
	}

}
