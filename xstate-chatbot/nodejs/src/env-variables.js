const os = require('os');

const envVariables = {
    serviceId : process.env.NAME || 'xstate-chatbot-server',
    ver : process.env.VERSION || '0.0.1',

    port: process.env.SERVICE_PORT || 8080,
    contextPath : process.env.CONTEXT_PATH || '/',

    whatsAppProvider: process.env.WHATSAPP_PROVIDER || 'console',

    serviceProvider: process.env.SERVICE_PROVIDER || 'dummy',

    repoProvider: process.env.REPO_PROVIDER || 'PostgreSQL',

    mdmsHost: process.env.MDMS_HOST || 'https://egov-micro-dev.egovernments.org/',

    localisationServiceHost: process.env.LOCALISATION_SERVICE_HOST || 'https://egov-micro-dev.egovernments.org/',
    localisationServiceSearchPath: process.env.LOCALISATION_SERVICE_SEARCH_PATH || 'localization/messages/v1/_search',

    rootTenantId: process.env.ROOT_TENANTID || 'pb',

    supportedLocales: process.env.SUPPORTED_LOCALES || 'en_IN,hi_IN',

    externalHost: process.env.EXTERNAL_HOST || 'https://egov-micro-dev.egovernments.org/',

    cityExternalWebpagePath: process.env.CITY_EXTERNAL_WEBPAGE_PATH || 'citizen/openlink/whatsapp/city',
    localityExternalWebpagePath: process.env.LOCALITY_EXTERNAL_WEBPAGE_PATH || 'citizen/openlink/whatsapp/locality',

    whatsAppBusinessNumber : process.env.WHATSAPP_BUSINESS_NUMBER || '917834811114',

    userServiceHost: process.env.USER_SERVICE_HOST || 'https://egov-micro-dev.egovernments.org/',
    userServiceOAuthPath: process.env.USER_SERVICE_OAUTH_PATH || 'user/oauth/token',
    userServiceCreateCitizenPath: process.env.USER_SERVICE_CREATE_CITIZEN_PATH || 'user/citizen/_create',
    userServiceUpdateProfilePath: process.env.USER_SERVICE_UPDATE_PROFILE_PATH || 'user/profile/_update',
    userServiceHardCodedPassword: process.env.USER_SERVICE_HARDCODED_PASSWORD || '123456',
    userLoginAuthorizationHeader: process.env.USER_LOGIN_AUTHORIZATION_HEADER || 'Basic ZWdvdi11c2VyLWNsaWVudDplZ292LXVzZXItc2VjcmV0',

    billServiceHost: process.env.BILL_SERVICE_HOST || 'https://egov-micro-dev.egovernments.org/',
    billServiceSearchPath: process.env.BILL_SERVICE_SEARCH_PATH || 'billing-service/bill/v2/_search',
    googleAPIKey: process.env.GOOGLE_API_KEY || '',

    valueFirstUsername: process.env.VALUEFIRST_USERNAME || 'demo',
    valueFirstPassword: process.env.VALUEFIRST_PASSWORD || 'demo',
    valueFirstURL: process.env.VALUEFIRST_SEND_MESSAGE_URL || 'https://api.myvaluefirst.com/psms/servlet/psms.JsonEservice',

    egov_filestore_service_host: process.env.EGOV_FILESTORE_SERVICE_HOST || "https://egov-micro-dev.egovernments.org/",
    egov_filestore_service_upload_endpoint: process.env.EGOV_FILESTORE_SERVICE_UPLOAD_ENDPOINT || "filestore/v1/files?tenantId=pb&module=chatbot",
    egov_filestore_service_download_endpoint: process.env.EGOV_FILESTORE_SERVICE_DOWNLOAD_ENDPOINT || "filestore/v1/files/url"
}

module.exports = envVariables;