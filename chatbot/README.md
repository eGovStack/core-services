# Chatbot

Chatbot service is a chatbot which provides functionality to the user to access PGR module services like file complaint, track complaint, notifications from whatsapp. Currently citizen has three options to start conversation scan QR code, give missed call or directly send message to configured whatsapp number.

### DB UML Diagram

- Add the UML diagram for the DB here

### Service Dependencies

- egov-user-chatbot : For creating user without name validation and logging in user
- egov-user : For searching user
- egov-localization : The chatbot is made such that it will store localization codes and the actual text value will be fetched only at the end. This way we can provide multi-lingual support. Localization service is also used to construct messages from templates. This dependency can be eliminated if you want to pass values instead of localization codes.
- egov-filestore : It is a dependency if you want to send/receive any file. This includes sending PDF/Image files.
- egov-url-shortening : For shorting links sent to the user
- egov-mdms-service : For loading mdms data
- egov-location : For loading locality data
- rainmaker-pgr : For creating/searching PGR complaints

### Swagger API Contract

Link to the swagger API contract yaml and editor link like below

http://editor.swagger.io/?url=https://raw.githubusercontent.com/egovernments/core-services/master/docs/common-contract.yml#!/


## Service Details

<write Details about the service>

### API Details

`POST /_create` 

Creates or Updates Master Data on GitHub as JSON files

- `MDMSCreateRequest`:  Request Info +  MasterDetail — Details of the master data that is to be created or updated on Github. 

- `MasterDetail`

    | Input Field                               | Description                                                       | Mandatory  |   Data Type      |
    | ----------------------------------------- | ------------------------------------------------------------------| -----------|------------------|
    | `tenantId`                                | Unique id for a tenant.                                           | Yes        | String           |
    | `filePath`                                | file-path on git where master data is to be created or updated    | Yes        | String           |
    | `masterName`                              | Master Data name to be created or updated                         | Yes        | String           |
    | `masterData`                              | content to be written on to the Config file                       | Yes        | Object           |

### Kafka Consumers

- The service uses consumers for only internal proessing. It does not have any consumer to interact with other services.

### Kafka Producers

- The service uses producers for only internal proessing. It does not have any producer to interact with other services.
