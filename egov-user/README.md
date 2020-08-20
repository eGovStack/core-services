# Egov indexer service

<p>Egov indexer service runs as a seperate service, This service is designed to perform all the indexing tasks of the egov platform. The service reads records posted on specific kafka topics and picks the corresponding index configuration from the yaml file provided by the respective module. </p>

### DB UML Diagram

- NA

### Service Dependencies

- egov-mdms-service
- egov-enc-service
- egov-otp
- egov-filestore


### Swagger API Contract

http://editor.swagger.io/?url=https://raw.githubusercontent.com/egovernments/egov-services/master/docs/egov-user/contracts/v1-1-0.yml#!/

## Service Details

Egov indexer service is used in egov platform for all indexing requirements. This service performs three major tasks namely: LiveIndex (indexing the live transaction data), Reindex (indexing data from one index to the othe) and LegacyIndex (indexing legacy data from the DB). For any indexing requirement we have to add a config. There we define source and, destination elastic search index name, custom mappings for data transformation and mappings for data enrichment. Currently following features are supported :-
- Multiple indexes of a record posted on a single topic
- Provision for custom index id
- Performs both bulk and non-bulk indexing
- Supports custom json indexing with field mappings, Enrichment of the input object on the queue
- Performs ES down handling

#### Configurations
NA

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

End-point to update the user details without otp validations. User's username, type and tenantId are not updated and ignored in update.

g) `POST /profile/_update`

End-point to update user profile. This allows partial update on user's account.

h) `POST /password/_update`

End-point to update the password for loggedInUser. The existing password is validated before updating new password.

i) `POST /password/nologin/_update`

End-point to update the password for non logged in user. The otp is validated before updating new password.

j) `POST /_logout`

Endpoint to logout session

k) `POST /user/oauth/token`

Endpoint for login. If the user is citizen the login is otp based else it is password based.



### Kafka Consumers
NA

### Kafka Producers
- ```audit_data``` : used in ```kafka.topic.audit``` application property, user service uses this topic for logging user data decryption calls.
