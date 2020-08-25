# Local Setup

To setup the egov-user service in your local system, clone the [Core Service repository](https://github.com/egovernments/core-services).

## Dependencies

### Infra Dependency

- [X] Postgres DB
- [X] Redis
- [ ] Elasticsearch
- [X] Kafka
  - [ ] Consumer
  - [X] Producer

## Running Locally

```bash
-To run egov-user service locally follow below steps, 
 - Port forward encryption services locally.
   kubectl -n egov port-forward <egov-enc-service-PODNAME> 1234:8080
 - Run redis on port 6379
```
