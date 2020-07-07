## Master Data Management service

#### Requirements
1. Prior Knowledge of Java/J2EE.
2. Prior Knowledge of Spring Boot.
3. Prior Knowledge of REST APIs and related concepts like path parameters, headers, JSON etc.
4. Prior knowledge of Git.
5. Advanced knowledge on how to operate JSON data would be an added advantage to understand the service.

#### Local Setup

To setup the MDMS service, clone the [Core Service repository](https://github.com/egovernments/core-services). And in MDMS service update the `application.properties` and change

- Update `egov.mdms.conf.path` to point to the folder where the master data is stored. [Sample](https://github.com/egovernments/egov-mdms-data/blob/master/data/pb/)
- Update the `masters.config.url` to point to the file which has the masters configuration. [Sample](https://github.com/egovernments/egov-mdms-data/blob/master/master-config.json)

Each master has three key parameters `tenantId`, `moduleName`, `masterName`. A sample master would look like below

```json
{
  "tenantId": "pb",
  "moduleName": "common-masters",
  "OwnerType": [
    {
      "code": "FREEDOMFIGHTER",
      "active": true
    },
    {
      "code": "WIDOW",
      "active": true
    },
    {
      "code": "HANDICAPPED",
      "active": true
    }
  ]
}
```

Here `tenantId=pb`, `moduleName=common-masters`, `masterName=OwnerType`