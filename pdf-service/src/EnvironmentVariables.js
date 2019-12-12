const envVariables = {
  MAX_NUMBER_PAGES: process.env.MAX_NUMBER_PAGES || 80,
  EGOV_LOCALISATION_HOST:
    process.env.EGOV_LOCALISATION_HOST || "https://egov-micro-dev.egovernments.org",
  EGOV_FILESTORE_SERVICE_HOST:
    process.env.EGOV_FILESTORE_SERVICE_HOST || "https://egov-micro-dev.egovernments.org",
  SERVER_PORT: process.env.SERVER_PORT || 8086,

  KAFKA_BROKER_HOST: process.env.KAFKA_BROKER_HOST || "localhost:9092",
  KAFKA_CREATE_JOB_TOPIC:
    process.env.KAFKA_CREATE_JOB_TOPIC || "PDF_GEN_CREATE",
  KAFKA_RECEIVE_CREATE_JOB_TOPIC:
    process.env.KAFKA_RECEIVE_CREATE_JOB_TOPIC || "PDF_GEN_RECEIVE",
  DB_USER: process.env.DB_USER || "postgres",
  DB_PASSWORD: process.env.DB_PASSWORD || "postgres",
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_NAME: process.env.DB_NAME || "PdfGen",
  DB_PORT: process.env.DB_PORT || 5432,
  DEFAULT_LOCALISATION_LOCALE:
    process.env.DEFAULT_LOCALISATION_LOCALE || "en_IN",
    DEFAULT_LOCALISATION_TENANT:
    process.env.DEFAULT_LOCALISATION_TENANT || "pb",
  DATA_CONFIG_URLS: process.env.DATA_CONFIG_URLS || "file:///home/rohit/Desktop/Workspace/config/configs/pdf-service/data-config/testlocalconsolidatedreceipt.json,file:///home/rohit/Desktop/Workspace/config/configs/pdf-service/data-config/consolidatedreceipt.json,file:///home/rohit/Desktop/Workspace/config/configs/pdf-service/data-config/consolidatedbill.json,file:///home/rohit/Desktop/Workspace/config/configs/pdf-service/data-config/tl-receipt.json,file:///home/rohit/Desktop/Workspace/config/configs/pdf-service/data-config/tlapplication.json",
  FORMAT_CONFIG_URLS: process.env.FORMAT_CONFIG_URLS || "file:///home/rohit/Desktop/Workspace/config/configs/pdf-service/format-config/testlocalconsolidatedreceipt.json,file:///home/rohit/Desktop/Workspace/config/configs/pdf-service/format-config/consolidatedreceipt.json,file:///home/rohit/Desktop/Workspace/config/configs/pdf-service/format-config/consolidatedbill.json,file:///home/rohit/Desktop/Workspace/config/configs/pdf-service/format-config/tl-receipt.json,file:///home/rohit/Desktop/Workspace/config/configs/pdf-service/format-config/tlapplication.json"
};
export default envVariables;
