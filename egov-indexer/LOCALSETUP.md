# Local Setup

To setup the Indexer service in your local system, clone the [Core Service repository](https://github.com/egovernments/core-services).

## Dependencies

### Infra Dependency

- [X] Postgres DB
- [ ] Redis
- [X] Elasticsearch
- [X] Kafka
  - [X] Consumer
  - [X] Producer

## Running Locally

```bash
-To run the indexer service locally, you need to port forward mdms services locally and change `egov.mdms.host` property accordingly.
- kubectl -n egov port-forward <egov-mdms-service-PODNAME> 8085:8080

-update below listed properties in `application.properties` prior to running the project:

 egov.indexer.yml.repo.path : path to config files

```