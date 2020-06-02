package org.egov.common.exceptions;

import org.apache.commons.io.*;
import org.apache.http.client.methods.*;
import org.egov.common.contract.model.HttpStatus;
import org.egov.common.contract.response.*;
import sun.reflect.generics.reflectiveObjects.*;

import java.io.*;

public class HttpClientException extends Exception {
    private int statusCode;
    private String body;

    public HttpClientException(IOException e) {
        initCause(e);
    }

    public HttpClientException(CloseableHttpResponse res) {
        statusCode = res.getStatusLine().getStatusCode();
        try {
            body = IOUtils.toString(res.getEntity().getContent(), "UTF-8");
        } catch (IOException e) {
            body = null;
        }
    }

    public String getRawResponse() {
        return body;
    }

    public ErrorResponse getErrorResponse() {
        throw  new NotImplementedException();
    }

    public int getStatusCode()
    {
        return statusCode;
    }

    public HttpStatus getStatus() {
        return HttpStatus.valueOf(getStatusCode());
    }

}
