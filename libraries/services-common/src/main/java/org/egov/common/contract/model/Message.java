package org.egov.common.contract.model;

import com.fasterxml.jackson.annotation.*;
import lombok.*;
import org.egov.domain.model.*;
import org.hibernate.validator.constraints.*;

@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class Message {
	@NotEmpty
	private String code;
	@NotEmpty
	private String message;
	@NotEmpty
	private String module;
	@NotEmpty
	private String locale;

	public Message(org.egov.domain.model.Message domainMessage) {
		this.code = domainMessage.getCode();
		this.message = domainMessage.getMessage();
		this.module = domainMessage.getModule();
		this.locale = domainMessage.getLocale();
	}

	@JsonIgnore
	public MessageIdentity getMessageIdentity(Tenant tenant) {
		return MessageIdentity.builder().code(code).module(module).locale(locale).tenant(tenant).build();
	}
}
