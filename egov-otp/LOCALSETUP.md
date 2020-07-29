# Local Setup

To setup the OTP service in your local system, clone the [Core Service repository](https://github.com/egovernments/core-services).

## Dependencies

### Infra Dependency

- [X] Postgres DB
- [ ] Redis
- [ ] Elasticsearch
- [ ] Kafka
  - [ ] Consumer
  - [ ] Producer

## Running Locally

To run this services locally, you need to port forward below services locally 

```bash
kubectl -n egov port-forward <egov-otp-PODNAME> 8089:5005