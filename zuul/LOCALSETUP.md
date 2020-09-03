# Local Setup

To setup the Zuul service in your local system, clone the [Core Service repository](https://github.com/egovernments/core-services).

## Dependencies

### Infra Dependency

- [ ] Postgres DB
- [ ] Redis
- [ ] Elasticsearch
- [ ] Kafka
  - [ ] Consumer
  - [ ] Producer

## Running Locally

To run the Zuul services in your local system, you need to port forward below services

```bash
 kubectl port-forward -n egov {egov-accesscontrol} 8087:8080
 kubectl port-forward -n egov {egov-user} 8088:8080
``` 

Update below listed properties in **`application.properties`** before running the project:

```ini
-egov.auth-service-host = {user service hostname}

-egov.authorize.access.control.host = {access control service hostname} 

-zuul.routes.filepath = {path of file which contain the routing information of each modules} 
 If you are using a local file prefix it with file:///PATH TO FILE/FILENAME
```