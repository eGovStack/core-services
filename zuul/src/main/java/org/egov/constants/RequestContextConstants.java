package org.egov.constants;

public class RequestContextConstants {
    public static final String AUTH_BOOLEAN_FLAG_NAME = "shouldDoAuth";
    public static final String AUTH_TOKEN_KEY = "authToken";
    public static final String ERROR_MESSAGE_KEY = "error.message";
    public static final String ERROR_CODE_KEY = "error.status_code";
    public static final String CURRENT_REQUEST_TENANTID = "request.tenant_id";
    public static final String CURRENT_REQUEST_SANITIZED_BODY = "request.body.sanitized";
    public static final String CURRENT_REQUEST_SANITIZED_BODY_STR = "request.body.sanitized.str";
    public static final String CURRENT_REQUEST_START_TIME = "request.time.start";
    public static final String CURRENT_REQUEST_END_TIME = "request.time.end";
    public static final String GET = "GET";
    public static final String POST = "POST";
    public static final String PUT = "PUT";
    public static final String PATCH = "PATCH";

    public static final String FILESTORE_REGEX = "^/filestore/.*";
    public static final String REQUEST_INFO_FIELD_NAME_PASCAL_CASE = "RequestInfo";
    public static final String REQUEST_INFO_FIELD_NAME_CAMEL_CASE = "requestInfo";
    public static final String USER_INFO_FIELD_NAME = "userInfo";
    public static final String USER_INFO_KEY = "USER_INFO";
    public static final String CORRELATION_ID_FIELD_NAME = "correlationId";
    public static final String CORRELATION_ID_HEADER_NAME = "x-correlation-id";
    public static final String CORRELATION_ID_KEY = "CORRELATION_ID";
    public static final String RBAC_BOOLEAN_FLAG_NAME = "shouldDoRbac";
    public static final String SKIP_RBAC = "RBAC check skipped";
    public static final String REQUEST_TENANT_ID_KEY = "tenantId";
    public static final String TENANT_ID_KEY = "TENANT_ID";
}
