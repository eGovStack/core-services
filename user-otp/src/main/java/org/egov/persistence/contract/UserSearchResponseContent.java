package org.egov.persistence.contract;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import org.egov.domain.model.User;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UserSearchResponseContent {
	private Long id;
	private String emailId;
	private String mobileNumber;

	public User toDomainUser() {
		return new User(id, emailId,mobileNumber);
	}
}