# Local Setup

To setup the Chatbot service in your local system, clone the [Core Service repository](https://github.com/egovernments/core-services).

## Dependencies

### Infra Dependency

- [X] Postgres DB
- [ ] Redis
- [ ] Elasticsearch
- [X] Kafka
  - [X] Consumer
  - [X] Producer

## Running Locally

To run the Chatbot services locally, update below listed properties in `xternal.properties` before running the project:

```ini
valuefirst.username =
valuefirst.password =
valuefirst.whatsapp.number =
```
- Update  `valuefirst.whatsapp.number` to the number to be used on server
- Update `valuefirst.username` and `valuefirst.password` with username and password for configured number for sending messages to user through whatsapp provider api calls

