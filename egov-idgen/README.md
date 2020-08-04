# egov-idgen service

The egov-idgen service generates new id based on the id formats passed. The application exposes a Rest API to take in requests and provide the ids in response in the requested format. 

### DB UML Diagram

- TBD

### Service Dependencies

- egov-mdms-service

### Swagger API Contract

Link to the swagger API contract yaml and editor link like below

http://editor.swagger.io/?url=https://raw.githubusercontent.com/egovernments/egov-services/master/docs/idgen/contracts/v1-0-0.yml#!/


## Service Details

The application can be run as any other spring boot application but needs lombok extension added in your ide to load it. Once the application is up and running API requests can be posted to the url and ids can be generated.
In case of intellij the plugin can be installed directly, for eclipse the lombok jar location has to be added in eclipse.ini file in this format -javaagent:lombok.jar.

## Reference document

- https://digit-discuss.atlassian.net/l/c/eH501QE3

### API Details

- id/v1/_genearte

a) `POST /_generate`

API to generate new id based on the id formats passed.

- `Parameters`

    |  IdRequest Field                          | Description
    | ----------------------------------------- | ------------------------------------------------------------------
    | `idName`                                  | It would indicate the type of id, we would like to generate, ex upic no or acknowledgement number. 
                                                  Please note that the id format can also be configured with idGen service with this name in case calling services 
                                                  wishes to do so, so as to not needing to pass the format each time. In such a case if the format is passed at the
                                                  runtime then the passed format will take precedence over configured format. idName should be namespaced with 
                                                  module/functionality e.g. propertytax.acknumber or propertytax.assessmentnumber
    | `tenantId`                                | tenantid for which Id has to be generated.
    | `format`                                  | format of the id to be generated. Supported as per the description of the service.
    

### Kafka Consumers

- NA

### Kafka Producers

- NA