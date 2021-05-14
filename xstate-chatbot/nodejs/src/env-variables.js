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
        botname: process.env.GUPSHUP_BOT_NAME || 'SwasthAppBot',
        apikey: process.env.GUPSHUP_API_KEY || ''
    },

    kafka: {
        kafkaBootstrapServer: process.env.KAFKA_BOOTSTRAP_SERVER || 'localhost:9092',
        chatbotTelemetryTopic: process.env.CHATBOT_TELEMETRY_TOPIC || 'chatbot-telemetry-v2',

        kafkaConsumerEnabled: process.env.KAFKA_CONSUMER_ENABLED || true,
        kafkaConsumerGroupId: process.env.KAFKA_CONSUMER_GROUP_ID || 'xstate-chatbot',
    },

}

module.exports = envVariables;