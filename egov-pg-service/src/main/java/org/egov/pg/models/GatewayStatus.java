package org.egov.pg.models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.egov.pg.service.Gateway;

@Getter
@AllArgsConstructor
@ToString
@NoArgsConstructor
public class GatewayStatus {
    private Gateway gateway;
    private boolean active;
}
