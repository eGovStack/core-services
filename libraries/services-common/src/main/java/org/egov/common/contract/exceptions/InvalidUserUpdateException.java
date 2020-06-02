package org.egov.common.contract.exceptions;

import lombok.*;
import org.egov.common.contract.model.*;

public class InvalidUserUpdateException extends RuntimeException {

    private static final long serialVersionUID = 580361940613077431L;
    @Getter
    private User user;

    public InvalidUserUpdateException(User user) {
        this.user = user;
    }

}
