# Local Setup

To setup the Report service in your local system, clone the [Core Service repository](https://github.com/egovernments/core-services).

## Dependencies

### Infra Dependency

- [X] Postgres DB
- [ ] Redis
- [ ] Elasticsearch
- [X] Kafka
  - [ ] Consumer
  - [X] Producer

## Running Locally

```bash
-To run report service locally, you need to port forward mdms and encryption services locally.
- kubectl -n egov port-forward <egov-mdms-service-PODNAME> 8094:8080
- kubectl -n egov port-forward <egov-enc-service-PODNAME> 1234:8080

-update below listed properties in `application.properties` prior to running the project:

 report.locationsfile.path : path to `reportFileLocationsv1.txt` file from local https://github.com/egovernments/configs/tree/master/reports repo

```