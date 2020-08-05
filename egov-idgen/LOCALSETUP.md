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
`spring.datasource.url`          : Local db URL

`spring.datasource.username`     : Local db username

`spring.datasource.password`     : Local db password

`mdms.service.host`              : The host of the running environment (eg:https://egov-micro-qa.egovernments.org/citizen)

`mdms.service.search.uri`        : MDMS service URI. i.e egov-mdms-service/v1/_search
```

```bash
kubectl -n egov port-forward <egov-mdms-service-PODNAME> 8094:5005
