# eGov Encryption Service

Encryption Service is used to secure the data. It provides functionality to encrypt and decrypt data

### DB UML Diagram

- NA

### Service Dependencies

- egov-mdms-service


### Swagger API Contract

http://editor.swagger.io/?url=https://raw.githubusercontent.com/egovernments/egov-services/master/docs/egov-enc-service/contract/enc-service.yaml#!/

## Service Details

Encryption Service offers following features : 

- Encrypt - The service will encrypt the data based on given input parameters and data to be encrypted. The encrypted data will be mandatorily of type string.
- Decrypt - The decryption will happen solely based on the input data (any extra parameters are not required). The encrypted data will have identity of the key used at the time of encryption, the same key will be used for decryption.
- Sign - Encryption Service can hash and sign the data which can be used as unique identifier of the data. This can also be used for searching gicen value from a datastore.
- Verify - Based on the input sign and the claim, it can verify if the the given sign is correct for the provided claim.
- Rotate Key - Encryption Service supports changing the key used for encryption. The old key will still remain with the service which will be used to decrypt old data. All the new data will be encrypted by the new key.

#### Configurations
NA


### API Details
NA

### Kafka Consumers
NA

### Kafka Producers
NA
