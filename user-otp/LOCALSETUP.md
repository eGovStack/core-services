# Local Setup

To setup the user-otp service in your local system, clone the [Core Service repository](https://github.com/egovernments/core-services).

## Dependencies

### Infra Dependency

- [ ] Postgres DB
- [ ] Redis
- [ ] Elasticsearch
- [x] Kafka
  - [ ] Consumer
  - [x] Producer

## Running Locally

To run the user-otp service in your local system, you need to port forward below services

```bash
 kubectl port-forward -n egov {egov-localization pod id} 8087:8080
 kubectl port-forward -n egov {egov-user pod id} 8088:8080
 kubectl port-forward -n egov {egov-otp pod id} 8089:8080
``` 

Update below listed properties in **`application.properties`** before running the project:

```ini
-user.host = {egov-user service hostname}

-otp.host = {egov-otp service hostname}

-egov.localisation.host = {egov-localisation service hostname}
```