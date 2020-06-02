package org.egov.common.contract.exceptions;

import lombok.*;
import org.egov.common.contract.model.*;

@Getter
public class InvalidUserCreateException extends RuntimeException {

    private static final long serialVersionUID = -761312648494992125L;
    private User user;

    public InvalidUserCreateException(User user) {
        this.user = user;
    }

}

