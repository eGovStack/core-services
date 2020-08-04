# Local Setup

This document will walk you through the dependencies of eGov-Searcher and how to set it up locally

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
 kubectl port-forward -n egov {egov-user} 8088:8080

``` 

Update below listed properties in `application.properties` before running the project:

```ini
 
-spring.datasource.url=jdbc:postgresql://localhost:5432/{local postgres db name}

-egov.user.contextpath=

-search.yaml.path=

 The git hub link for the file containing searcher query has to be provided here
 
 if you are using a local file prefix it with file:///PATH TO FILE/FILENAME
```
