# Chatbot

Chatbot service is a chatbot which provides functionality to the user to access PGR module services like file complaint, track complaint, notifications from whatsapp. Currently citizen has three options to start conversation scan QR code, give missed call or directly send message to configured whatsapp number.

### DB UML Diagram

- NA

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

Chatbot facilitates conversational integration of a Rest based microservice application. It collects data in multiple
 stages of a conversation and makes a Rest call at the end of the flow.
 
It's conversational flow can be defined using a tree which contains all possible ways a conversation with a user can go. 

Currently, it supports input values of following type:
1. Text : These can be further classified as:
    * Free text : The input answer will be forwarded as is.
    * Fixed Set Values : When the answer could be only one out of the given set of values 
2.  Image : User can send an image to the chatbot which will be stored in egov-filestore.

Chatbot facilitates conversational integration of a Rest based microservice application. It collects data in multiple
 stages of a conversation and makes a Rest call at the end of the flow.
 
#### Configurations 

There are two types of configurations for chatbot states:-
- Configuration for each state in chatbot
- Graph adjacency list configuration:- to define flow between chatbot states

  ex:-
     `root,pgr.create.tenantId,pgr.track.end
  
      pgr.create.tenantId,pgr.create.locality
      
      pgr.create.locality,pgr.create.landmark`

### API Details


a) `POST /messages` 

Receive user sent message and forward it to chatbot core logic for further processing and sending back response

- `Parameters`

    | Input Field                               | Description                                                       
    | ----------------------------------------- | ------------------------------------------------------------------
    | `to       `                               | Configured whatsapp server mobile number                                           
    | `from`                                    | User's mobile number
    | `text`                                    | The text that user want to send to the server in case of media type is text                      
    | `media_type`                              | type of message ex:- text, image
    | `media_data`                              | Media data if media type other than text
    
b) `GET /messages` 

Receive user sent message and forward it to chatbot core logic for further processing and sending back response

- `Parameters`

    | Input Field                               | Description                                                       
    | ----------------------------------------- | ------------------------------------------------------------------
    | `to       `                               | Configured whatsapp server mobile number                                           
    | `from`                                    | User's mobile number
    | `text`                                    | The text that user want to send to the server in case of media type is text                      
    | `media_type`                              | type of message ex:- text, image
    | `media_data`                              | Media data if media type other than text    

### Kafka Consumers

- The service uses consumers for only internal proessing. It does not have any consumer to interact with other services.

### Kafka Producers

- The service uses producers for only internal proessing. It does not have any producer to interact with other services.
