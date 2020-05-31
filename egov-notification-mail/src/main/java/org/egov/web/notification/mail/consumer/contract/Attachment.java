package org.egov.web.notification.mail.consumer.contract;

import lombok.*;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class Attachment {

    private String tenantId;

    private String fileStoreId;

}
