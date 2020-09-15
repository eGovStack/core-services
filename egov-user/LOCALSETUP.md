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

To run egov-user service locally follow below steps, Port forward encryption services locally

```bash
function kgpt(){kubectl get pods -n egov --selector=app=$1 --no-headers=true | head -n1 | awk '{print $1}'}
kubectl port-forward -n egov $(kgpt egov-enc-service) 8087:8080
```

Run redis on port 6379
