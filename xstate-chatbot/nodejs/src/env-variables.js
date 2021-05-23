const os = require('os');

const envVariables = {
    serviceId: process.env.NAME || 'xstate-chatbot',
    ver: process.env.VERSION || '0.0.1',

    port: process.env.SERVICE_PORT || 8080,
    contextPath: process.env.CONTEXT_PATH || '/covid-chatbot',

    staticMediaPath: process.env.STATIC_MEDIA_PATH || 'resources/assets/static-media',
    dynamicMediaPath: process.env.DYNAMIC_MEDIA_PATH || 'resources/assets/dynamic-media',

    whatsAppProvider: process.env.WHATSAPP_PROVIDER || 'console',

    serviceProvider: process.env.SERVICE_PROVIDER || 'Dummy',

    repoProvider: process.env.REPO_PROVIDER || 'InMemory',

    whatsAppBusinessNumber: process.env.WHATSAPP_BUSINESS_NUMBER || '917834811114',

    rootTenantId: process.env.ROOT_TENANTID || 'in',

    supportedLocales: process.env.SUPPORTED_LOCALES || 'en_IN,hi_IN,pa_IN',

    dateFormat: process.env.DATEFORMAT || 'DD/MM/YYYY',
    timeZone: process.env.TIMEZONE || 'Asia/Kolkata',

    postgresConfig: {
        dbHost: process.env.DB_HOST || 'localhost',
        dbPort: process.env.DB_PORT || '5432',
        dbName: process.env.DB_NAME || 'chat',
        dbUsername: process.env.DB_USER || 'postgres',
        dbPassword: process.env.DB_PASSWORD || ''
    },

    gupshup: {
        botname: process.env.GUPSHUP_BOT_NAME || 'CovaChatbot',
        apikey: process.env.GUPSHUP_API_KEY || ''
    },

    valueFirstWhatsAppProvider: {
        valueFirstUsername: process.env.VALUEFIRST_USERNAME || 'demo',
        valueFirstPassword: process.env.VALUEFIRST_PASSWORD || 'demo',
        valueFirstURL: process.env.VALUEFIRST_SEND_MESSAGE_URL || 'https://api.myvaluefirst.com/psms/servlet/psms.JsonEservice',
        valueFirstWelcomeMessageTemplateId: process.env.VALUEFIRST_WELCOME_MESSAGE_TEMPLATE_ID || '3459715',
    },

    kafka: {
        kafkaBootstrapServer: process.env.KAFKA_BOOTSTRAP_SERVER || 'localhost:9092',
        chatbotTelemetryTopic: process.env.CHATBOT_TELEMETRY_TOPIC || 'chatbot-telemetry-v2',

        kafkaConsumerEnabled: process.env.KAFKA_CONSUMER_ENABLED || true,
        kafkaConsumerGroupId: process.env.KAFKA_CONSUMER_GROUP_ID || 'xstate-chatbot',
    },

    covaApiConfigs: {
        covaUrl                     : 'https://covaprod.punjab.gov.in/api/cova/citizen/services/v1/',
        updateSelfInspectionSuffix  : 'status/updateSelfInspection',
        cova2Url                    : 'https://cova.punjab.gov.in/api/cova/citizen/services/v1/',
        isHomeIsolatedSuffix        : 'get-whats-app-hi-active',
        addPatientSuffix            : 'insert-whats-app-pm-data',
        covaAuthorization           : process.env.COVA_BEARER_TOKEN || 'Bearer eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIzMjMiLCJ0cyI6IjU4IiwiZXhwIjoxNjM1OTI2OTEzLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjYzODg0IiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdDo2Mzg4NCJ9.ovY-mtV3vU005bvYT5SCZwyVPAx-tgRw8TxDdIucPn0',
        covaAuthToken               : process.env.COVA_AUTH_TOKEN || 'f77762bfd1a69c37227d9206c3c40c50c686f485'

    }

}

module.exports = envVariables;