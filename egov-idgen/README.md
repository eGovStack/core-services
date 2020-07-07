# eGov IdGen


Module is used to create unique ID's.

### Functionality
- Generate
   - egov-idgen/id/_generate api used to generate unique ID across the modules.
   - The response contains the id object with a unique ID.


### Project Structure 
*Packages*
 - api - Controllers for the app.
 - config - Contains all the configuration properties related to module
 - service - Consists of all services containing the business logic.
 - exception - Contains all validation code and exceptions
 - models - POJO for the module.


### Resources
- Granular details about the API's can be found in the [swagger api definition](https://github.com/egovernments/egov-services/blob/master/docs/idgen/contracts/v1-0-0.yml)
- Postman collection for all the API's can be found in the [postman collection](https://www.getpostman.com/collections/5a65242aa7629b17525a)


### Request Structure

```json

{
  "RequestInfo": {
    "apiId": "Mihy",
    "ver": ".01",
    "action": "",
    "did": "1",
    "key": "",
    "msgId": "20170310130900|en_IN",
    "requesterId": "",
    "authToken": "51e766df-53f7-421e-a898-f3a8480eac88"
  },
  "idRequests": [
    {
      "idName": "",
      "format": "UC/[CY:dd-MM-yyyy]/[seq_uc_demand_consumer_code]",
      "tenantId": "pb.amritsar"
    }
  ]
}

### Response Structure

```json

{
  "responseInfo": {
    "apiId": "Mihy",
    "ver": ".01",
    "ts": null,
    "resMsgId": "uief87324",
    "msgId": "20170310130900|en_IN",
    "status": "SUCCESSFUL"
  },
  "idResponses": [
    {
      "id": "UC/07-07-2020/001043"
    }
  ]
}

## Build & Run

- mvn clean install
- java -jar target/egov-idgen-1.2.0-SNAPSHOT.jar


