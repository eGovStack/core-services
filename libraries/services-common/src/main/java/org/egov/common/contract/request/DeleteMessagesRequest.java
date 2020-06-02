package org.egov.common.contract.request;

import com.fasterxml.jackson.annotation.*;
import lombok.*;
import org.egov.common.contract.request.*;
import org.egov.domain.model.*;

import javax.validation.*;
import javax.validation.constraints.*;
import java.util.*;
import java.util.stream.*;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class DeleteMessagesRequest {

	@JsonProperty("RequestInfo")
	private RequestInfo requestInfo;

	@NotNull
	private String tenantId;

	@Valid
	@Size(min = 1)
	private List<DeleteMessage> messages;

	public List<MessageIdentity> getMessageIdentities() {
		return messages.stream().map(message -> MessageIdentity.builder().code(message.getCode())
				.module(message.getModule()).locale(message.getLocale()).tenant(getTenant()).build())
				.collect(Collectors.toList());
	}

	public Tenant getTenant() {
		return new Tenant(tenantId);
	}

}
