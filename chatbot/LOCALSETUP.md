# Local Setup

This document will walk you through the dependencies of this service and how to set it up locally

## Dependencies

### Infra Dependency

- [X] Postgres DB
- [ ] Redis
- [ ] Elasticsearch
- [X] Kafka
  - [X] Consumer
  - [X] Producer

## Running Locally

To run this services locally, you need to port forward below services locally

```bash
kubectl -n egov port-forward XXXXX
``` 

Update below listed properties in `application.properties` before running the project:

```ini
egov.egfcommonmasters.hostname =
egov.egfmasters.hostname =
```
