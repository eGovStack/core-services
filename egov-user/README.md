# Egov indexer service

<p>Egov indexer service runs as a seperate service, This service is designed to perform all the indexing tasks of the egov platform. The service reads records posted on specific kafka topics and picks the corresponding index configuration from the yaml file provided by the respective module. </p>

### DB UML Diagram

- NA

### Service Dependencies

- ```egov-mdms-service :``` For enriching mdms data if mentioned in config


### Swagger API Contract

http://editor.swagger.io/?url=https://raw.githubusercontent.com/egovernments/core-services/RAIN-1284/docs/indexer-contract.yml#!/

## Service Details

Egov indexer service is used in egov platform for all indexing requirements. This service performs three major tasks namely: LiveIndex (indexing the live transaction data), Reindex (indexing data from one index to the othe) and LegacyIndex (indexing legacy data from the DB). For any indexing requirement we have to add a config. There we define source and, destination elastic search index name, custom mappings for data transformation and mappings for data enrichment. Currently following features are supported :-
- Multiple indexes of a record posted on a single topic
- Provision for custom index id
- Performs both bulk and non-bulk indexing
- Supports custom json indexing with field mappings, Enrichment of the input object on the queue
- Performs ES down handling

#### Configurations
ex:- https://raw.githubusercontent.com/egovernments/configs/master/egov-indexer/property-services.yml

The different fields used in index config are following:-
- mappings: List of mappings between topic name and respective index configurations.
- topic: The topic on which the input json will be recieved, This will be the parent topic for the list of index configs.
- indexes: List of index configuration to be applied on the input json recieved on the parent topic.
- name: name of the index.
- type: document type.
- id: Json path of the id to be used as index id while indexing. This takes comma seperated Jsonpaths to build custom index id. Values will be fetched from the json path and concatinated to form the indexId.
- isBulk: boolean value to signify if the input is a json array or json object, true in the first case, false other wise. Note: if isBulk = true, indexer will accept only array of json objects as input.
- jsonPath: Json Node path in case just a piece of the input json is to be indexed.
- customJsonMapping: Set of mappings for building an entirely new json object to index onto ES.
- indexMapping: Sample output json which will get indexed on to ES. This has to be provided by the respective module, if not provided, framework will fetch it from the ES. It is recommended to provide this.
- fieldMapping: This is a list of mappings between fields of input and output json namely: inJsonPath and outJsonPath. It takes inJsonPath value from input json and puts it to outJsonPath field of output json.
- uriMapping: This takes uri, queryParam, pathParam and apiRequest as to first build the uri and hit the service to get the response and then takes a list of fieldMappings as above to map fields of the api response to the fields of output json. Note: "$" is to be specified as place holder in the uri path wherever the pathParam is to be substituted in order. queryParams should be comma seperated.


### API Details


a) `POST /citizen/_create`

Create citizen with otp validation. If `citizen.registration.withlogin.enabled` property in applications.properties is `true` then created citizen would be logged in automatically and he 
would get information to access platform services, ex:- auth token, refresh token etc.

b) `POST /users/_createnovalidate`

Create user without any otp validation.

c) `POST /_search`

End-point to search the users by providing userSearchRequest. In Request if there is no active filed value, it will fetch only active users.
The available search parameters are more in interservice call as compared to call coming externally.

d) `POST /v1/_search`

Similar to `/_search` endpoint except there is no default value provided for search active/inactive users.

e) `POST /_details`

End-point to fetch the user details by access-token

f) `POST /users/_updatenovalidate`

End-point to update the user details without otp validations. User's username, type and tenantId are not update and ignored in update.

g) `POST /profile/_update`

This is used to migrate data from one index to another index

h) `POST /password/_update`

End-point to update the password for loggedInUser. The existing password is validated before updating new password.

i) `POST /password/nologin/_update`

End-point to update the password for non logged in user. The otp is validated before updating new password.

j) `POST /_logout`

Endpoint to logout session

k) `POST /user/oauth/token`

Endpoint for login. If the user is citizen the login is otp based else it is password based.



### Kafka Consumers
- The service uses consumers for topics defined in index configs to read data which is to be indexed.

### Kafka Producers
- ```dss-collection-update``` : used in ```egov.indexer.dss.collectionindex.topic``` application property, indexer service sends collection service data to this topic to be used by DSS module
- The indexer service produces to topic which is `{index_name}-enriched`, for providing option to use kafka-connect for pushing records to elastic search
- In case of legacy indexing, indexer service would produce data fetched from api call to external service to topic mentioned in `topic` field of config.
