
# egov-otp Service

OTP Service is a core service that is available on the DIGIT platform.  The service is used to authenticate the user in the platform.
The functionality is exposed via REST API.

### DB UML Diagram

- TBD

### Service Dependencies

- NA

### Swagger API Contract

Link to the swagger API contract yaml and editor link like below

http://editor.swagger.io/?url=https://raw.githubusercontent.com/egovernments/egov-services/master/docs/egov-otp/contract/v1-0-0.yml#!/


## Service Details

egov-otp is being called internally by user-otp service which fetches mobileNumber and feeds to egov-otp to generate 'n' digit OTP. 

### API Details

`BasePath` /egov-otp/v110

Egov-otp service APIs - contains create, validate and search end point

a) `POST /otp/v1/_create`   - create OTP Configuration this API is internal call from v1/_send end point, this end point present in user-otp service no need of explicity call

b) `POST /otp/v1/_validate` - validate OTP Configuration this end point is validate the otp respect to mobilenumber

c) `POST /otp/v1/_search`   - search the mobile number and otp using uuid ,uuid nothing but otp reference number

##### Method
 

- `Createotp`

    | Input Field                               | Description                                                       | Mandatory  |   Data Type      |
    | ----------------------------------------- | ------------------------------------------------------------------| -----------|------------------|
    | `otp`                                     | this is the five digit otp number ,this is mandatory in validate  |     No     |     String       |
    |                                           | end point should pass otp value in /otp/v1/_validate end point,   |            |                  |
    |                                           | in other end point it is read only                                |            |                  |
    |                                           |                                                                   |            |                  |
    | `uuid`                                    | this is otp reference id, this is mandatory in search end point   |     No     |     String       |
    |                                           | (/otp/v1/_search), and in other end point it is read only.        |            |                  |
    |                                           |                                                                   |            |                  |
    | `identity`                                | identity is username or mobile number. this is mandatory field in |    Yes     |     String       |
    |                                           | create and validate end point end point is(/otp/v1/_create, and   |            |                  |
    |                                           | /otp/v1/_validat) and optional field in /otp/v1/_search end point |            |                  |            
    |                                           |                                                                   |            |                  |
    | `tenantId`                                | Unique Identifier of the tenantId to which user primarily belongs |    Yes     |     String       |
    |                                           | and it is mandatory field in all the end points shoiuld pass      |            |                  |
    |                                           | this value                                                        |            |                  |  
    |                                           |                                                                   |            |                  |
    |`isValidationSuccessful`                   | it return true or false this is optional or read only property    |            |                  |                  |
    |                                           | in all end point,                                                 |    Yes     |     String       |
    | ------------------------------------------|-------------------------------------------------------------------|------------|------------------|                                          
    

- `CreateOTPConfigReq` :  Request Info +  Createotp 
- `OTPConfigRes        :  Response Info +  Createotp 


### Kafka Consumers

- NA

### Kafka Producers

- NA