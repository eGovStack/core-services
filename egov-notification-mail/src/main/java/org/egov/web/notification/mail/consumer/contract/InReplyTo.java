package org.egov.web.notification.mail.consumer.contract;

import lombok.*;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class InReplyTo {

    private String messageId;

    private String references;

}
