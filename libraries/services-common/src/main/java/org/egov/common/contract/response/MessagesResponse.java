package org.egov.common.contract.response;

import lombok.*;

import java.util.*;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class MessagesResponse {
	private List<Message> messages;
}
