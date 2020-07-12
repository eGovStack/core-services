# eGov User

The egov-user service is core service used to store and retrieve user data information and provide authentication.

### Functionality
- Store, update and search user data
- Provide authentication
- Provide login,logout functionality into DIGIT platform
- Store user data PIIs in encrypted form

#### Requirements
1. Prior Knowledge of Java/J2EE.
2. Prior Knowledge of Spring Boot.
3. Prior Knowledge of Spring Oauth2.
4. Prior Knowledge of Radis cache.
5. Prior Knowledge of REST APIs and related concepts like path parameters, headers, JSON etc.
6. Prior knowledge of Git.
7. Prior knowledge of Postgres.
8. Advanced knowledge on how to operate JSON data would be an added advantage to understand the service.

### Project Structure
*Packages*
 - web - Controllers and models used in controllers
 - security - Oauth2 implementation
 - repository - Contains rowmappers and queries for DB
 - persistence - Contains logic for DB accesses and calls to externals services ex:- otp, filestore, encryption service etc
 - domain - Contains POJO for the modules and contains service layer for the service


### Endpoints
 - `/citizen/_create` - specifically used for citizen account creation
 - `/users/_createnovalidate` - used for storing new user data
 - `/_search` - used to search active users based on search criteria
 - `/v1/_search` - used to search users based on search criteria
 - `/_details` - used to get user details from access_token
 - `/users/_updatenovalidate` - used to update existing user details
 - `/profile/_update` - used to let user update only his partial account details ex:- name, email and not sensitive fields ex:- roles, username
 - `/password/_update` - used to update password for logged in users
 - `/password/nologin/_update` - used to update password for non logged in users
 - `/oauth/token` - provide access token for authentication
 - `/_logout` - for logout and expire access token

 ### Resources
- Granular details about the API's can be found in the [swagger api definition](https://github.com/egovernments/egov-services/blob/master/docs/egov-user/contracts/v1-1-0.yml)
- Postman collection for all the API's can be found in the [postman collection](https://www.getpostman.com/collections/d20800f5f085c9653482)
