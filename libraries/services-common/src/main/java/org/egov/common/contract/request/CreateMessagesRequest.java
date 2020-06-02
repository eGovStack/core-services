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
public class CreateMessagesRequest {
	@JsonProperty("RequestInfo")
	private RequestInfo requestInfo;

	@NotEmpty
	private String tenantId;

	@Size(min = 1)
	@Valid
	private List<Message> messages;

	public List<org.egov.domain.model.Message> toDomainMessages() {
		return messages.stream().map(this::toDomainMessage).collect(Collectors.toList());
	}

	private org.egov.domain.model.Message toDomainMessage(Message contractMessage) {
		return org.egov.domain.model.Message.builder().message(contractMessage.getMessage())
				.messageIdentity(contractMessage.getMessageIdentity(getTenant())).build();
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
