# eGov User

The egov-user service is core service used to store and retrieve user data information and provide authentication.

### Functionality
- store, update and search user data
- provide authentication
- provide login,logout functionality into DIGIT platform
- store user data PIIs in encrypted form


### Project Structure 
*Packages*
 - web - Controllers and models used in controllers
 - security - Oauth2 implementation
 - repository - Contains rowmappers and queries for DB
 - persistence - Contains logic for DB accesses and calls to externals services ex:- otp, filestore, encryption service etc
 - domain - Contains POJO for the modules and contains service layer for the service


### Endpoints
 - /citizen/_create - specifically used for citizen account creation
 - /users/_createnovalidate - used for storing new user data
 - /_search - used to search active users based on search criteria
 - /v1/_search - used to search users based on search criteria
 - /_details - used to get user details from access_token
 - /users/_updatenovalidate - used to update existing user details
 - /profile/_update - used to let user update only his partial account details ex:- name, email and not sensitive fields ex:- roles, username
 - /password/_update - used to update password for logged in users
 - /password/nologin/_update- used to update password for non logged in users 
 - /oauth/token - provide access token for authentication
 - /_logout - for logout and expire access token
 
 ### Resources
- Postman collection for all the API's can be found in the [postman collection](https://www.getpostman.com/collections/d20800f5f085c9653482)
