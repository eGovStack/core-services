# Local Setup

To setup the egov-workflow-v2 service in your local system, clone the [Core Service repository](https://github.com/egovernments/core-services).

## Dependencies

### Infra Dependency

- [x] Postgres DB
- [ ] Redis
- [ ] Elasticsearch
- [x] Kafka
  - [ ] Consumer
  - [x] Producer

## Running Locally

To run the egov-workflow-v2 services locally, you need to port forward below services locally

```bash
 kubectl port-forward -n egov {egov-mdms} 8088:8080
 kubectl port-forward -n egov {egov-user} 8089:8080
``` 

Update below listed properties in `application.properties` before running the project:

```ini
 
-spring.datasource.url=jdbc:postgresql://localhost:5432/{local postgres db name}

-egov.mdms.host={mdms hostname}

-egov.mdms.search.endpoint = {mdms search endpoint}

-egov.user.host = {user service hostname}

-egov.user.search.endpoint = {user service search endpoint}

-egov.wf.statelevel = {true for state level and false for tenant level}

-egov.wf.inbox.assignedonly = {Boolean flag if set to true default search will return records assigned to the user only, if false it will return all the records based on user’s role.}
```