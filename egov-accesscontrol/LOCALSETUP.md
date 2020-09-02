# Local Setup

To setup the egov-accesscontrol service in your local system, clone the [Core Service repository](https://github.com/egovernments/core-services).

## Dependencies

### Infra Dependency

- [x] Postgres DB
- [ ] Redis
- [ ] Elasticsearch
- [ ] Kafka
  - [ ] Consumer
  - [ ] Producer

## Running Locally

To run the egov-accesscontrol services locally, you need to port forward below services locally

```bash
 kubectl port-forward -n egov {egov-mdms} 8088:8080
``` 

Update below listed properties in `application.properties` before running the project:

```ini
 
-spring.datasource.url=jdbc:postgresql://localhost:5432/{local postgres db name}

-spring.flyway.url=jdbc:postgresql://localhost:5432/{local postgres db name}

-egov.mdms.host={mdms hostname}

-egov.mdms.search.endpoint = {mdms search endpoint}

-mdms.roleactionmodule.name = {role action module name}

-mdms.actionstestmodule.name = {action test module name} 

-mdms.actionsmodule.name = {action module name}

-mdms.rolemodule.name = {role module name}

-mdms.rolemaster.name = {roles master name}

-mdms.actionmaster.names = {action master name}

-mdms.actiontestmaster.names = {action test master name}

-mdms.roleactionmaster.names = {roleactions master name}

-mdms.roleaction.path = {roleaction json path}

-mdms.actions.path = {action json path}

-mdms.actionstest.path = {action test json path}

-mdms.role.path = {role json path}
```