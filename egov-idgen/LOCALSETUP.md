# Local Setup

This document will walk you through the dependencies of this service and how to set it up locally

- To setup the egov-idgen service in your local system, clone the [Core Service repository](https://github.com/egovernments/core-services).

## Dependencies

### Infra Dependency

- [X] Postgres DB
- [ ] Redis
- [ ] Elasticsearch
- [ ] Kafka
  - [ ] Consumer
  - [ ] Producer

## Running Locally

To run the notification mail services locally, update below listed properties in `application.properties` before running the project:

```ini
spring.datasource.url=
spring.datasource.username=
spring.datasource.password=
mdms.service.host=
mdms.service.search.uri=
```

- Update the database related credentails in first three above mentioned properties
- Update the value of `mdms.service.host` to respective environment host 
- Update `mdms.service.search.uri` to value 'egov-mdms-service/v1/_search'

```bash
kubectl -n egov port-forward <egov-idgen-PODNAME> 8088:5005
