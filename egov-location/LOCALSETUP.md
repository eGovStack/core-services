# Local Setup

To setup the egov-location service in your local system, clone the [Core Service repository](https://github.com/egovernments/core-services).

## Dependencies

### Infra Dependency

- [x] Postgres DB
- [ ] Redis
- [ ] Elasticsearch
- [ ] Kafka
  - [ ] Consumer
  - [ ] Producer

## Running Locally

To run the egov-location services locally, you need to port forward below services locally

```bash
 kubectl port-forward -n egov {egov-mdms} 8088:8080
``` 

Update below listed properties in `application.properties` before running the project:

```ini
 
-spring.datasource.url=jdbc:postgresql://localhost:5432/{local postgres db name}

-egov.services.egov_mdms.hostname={mdms hostname}

-egov.service.egov.mdms.moduleName = {mdms module which contain boundary master}

-egov.service.egov.mdms.masterName = {mdms master file which contain boundary details}
```