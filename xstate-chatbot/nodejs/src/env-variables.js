const os = require('os');

const envVariables = {
    serviceId : process.env.NAME || 'xstate-chatbot',
    ver : process.env.VERSION || '0.0.1',

    port: process.env.SERVICE_PORT || 8080,
    contextPath : process.env.CONTEXT_PATH || '/xstate-chatbot',

    whatsAppProvider: process.env.WHATSAPP_PROVIDER || 'console',

    serviceProvider: process.env.SERVICE_PROVIDER || 'eGov',

    repoProvider: process.env.REPO_PROVIDER || 'PostgreSQL',

    postgresConfig: {
        dbHost: process.env.DB_HOST || 'localhost',
        dbPort: process.env.DB_PORT || '5432',
        dbName: process.env.DB_NAME || 'chat',
        dbUsername: process.env.DB_USER || 'postgres',
        dbPassword: process.env.DB_PASSWORD || ''
    },

    kafkaHost: process.env.KAFKA_BOOTSTRAP_SERVER || 'localhost:9092',

    chatbotTelemetryTopic: process.env.CHATBOT_TELEMETRY_TOPIC || 'chatbot-telemetry-v2',

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
    billSearchLimit: process.env.BILL_SEARCH_LIMIT || 5,
    googleAPIKey: process.env.GOOGLE_API_KEY || '',

    valueFirstUsername: process.env.VALUEFIRST_USERNAME || 'demo',
    valueFirstPassword: process.env.VALUEFIRST_PASSWORD || 'demo',
    valueFirstURL: process.env.VALUEFIRST_SEND_MESSAGE_URL || 'https://api.myvaluefirst.com/psms/servlet/psms.JsonEservice',

    egov_filestore_service_host: process.env.EGOV_FILESTORE_SERVICE_HOST || "https://egov-micro-dev.egovernments.org/",
    egov_filestore_service_upload_endpoint: process.env.EGOV_FILESTORE_SERVICE_UPLOAD_ENDPOINT || "filestore/v1/files?tenantId=pb&module=chatbot",
    egov_filestore_service_download_endpoint: process.env.EGOV_FILESTORE_SERVICE_DOWNLOAD_ENDPOINT || "filestore/v1/files/url",

    receiptdownladlink: process.env.RECEIPT_DOWNLOAD_LINK || 'citizen/withoutAuth/egov-common/download-receipt?status=success&consumerCode=$consumercode&tenantId=$tenantId&receiptNumber=$receiptNumber&businessService=$businessservice&smsLink=true&mobileNo=7391904467',
    msgpaylink: process.env.MSG_PAY_LINK || 'citizen/withoutAuth/egov-common/pay?consumerCode=$consumercode&tenantId=$tenantId&businessService=$businessservice',

    urlShortnerHost: process.env.URL_SHORTNER_HOST || 'https://egov-micro-dev.egovernments.org',
    urlShortnerEndpoint: process.env.URL_SHORTNER_ENDPOINT || '/egov-url-shortening/shortener',

    collectonServiceHost: process.env.COLLECTION_SERVICE_HOST || 'https://egov-micro-dev.egovernments.org/',
    collectonServicSearchEndpoint: process.env.COLLECTION_SERVICE_SEARCH_ENDPOINT || 'collection-services/payments/$module/_search',
    receiptSearchLimit: process.env.RECEIPT_SEARCH_LIMIT || 3,

    dateFormat: process.env.DATEFORMAT || 'DD/MM/YYYY',
    timeZone: process.env.TIMEZONE || 'Asia/Kolkata',

    billSupportedModules: process.env.BILL_SUPPORTED_MODULES || 'WS, PT, TL, FIRENOC, BPA'
}

module.exports = envVariables;