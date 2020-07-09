# Persister

### Egov persister service
Egov-Persister is a service running independently on seperate server. This service reads the kafka topics and put the messages in DB. We write a yml configuration and put the file path in application.properties.

#### Requirement
- Prior Knowledge of Java/J2EE.
- Prior Knowledge of SpringBoot.
- Prior Knowledge of PostgresSQL.
- Prior Knowledge of JSONQuery in Postgres. (Similar to PostgresSQL with a few aggregate functions.)

### Configuration
Persister uses configuration file to persist data. The key variables are described below:
- serviceName: Name of the service to which this configuration belongs.
- description: Description of the service.
- version: the version of the configuration.
- fromTopic: The kafka topic from which data is fetched
- queryMaps: Contains the list of queries to be executed for the given data.
- query: The query to be executed in form of prepared statement:
    - basePath: base of json object from which data is extrated
    - jsonMaps: Contains the list of jsonPaths for the values in placeholders.
    - jsonPath: The jsonPath to fetch the variable value.


```json
serviceMaps:
 serviceName: student-management-service
 mappings:
 - version: 1.0
   description: Persists student details in studentinfo table
   fromTopic: save-student-info
   isTransaction: true
   queryMaps:
       - query: INSERT INTO studentinfo( id, name, age, marks) VALUES (?, ?, ?, ?);
         basePath: Students.*
         jsonMaps:
          - jsonPath: $.Students.*.id

          - jsonPath: $.Students.*.name

          - jsonPath: $.Students.*.age

          - jsonPath: $.Students.*.marks
```

### Local setup
1. To setup the egov-persister service, clone the [Core Service repository](https://github.com/egovernments/core-services)
2. Write configuration as per your requirement. Structure of the config file is explained above.
3. In application.properties file, mention the local file path of configuration under the variable `egov.persist.yml.repo.path` while mentioning the  file path 
   we have to add `file://` as prefix. for example: `egov.persist.yml.repo.path = file:///home/rohit/Documents/configs/egov-persister/abc-persister.yml`. If there are multiple file seperate it with `,` .
4. In application.properties file, mentioned about the local DB in the following variable
    - spring.datasource.url=jdbc:postgresql://localhost:5432/[localDB]
    - spring.flyway.url=jdbc:postgresql://localhost:5432/[localDB]
5.  Run the egov-persister app and push data on kafka topic specified in config to persist it in DB
