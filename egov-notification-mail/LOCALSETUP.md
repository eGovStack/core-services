# Local Setup

This document will walk you through the dependencies of this service and how to set it up locally

- To setup the notification mail service in your local system, clone the [Core Service repository](https://github.com/egovernments/core-services).

## Dependencies

### Infra Dependency

- [X] Postgres DB
- [ ] Redis
- [ ] Elasticsearch
- [X] Kafka
  - [X] Consumer
  - [ ] Producer

## Running Locally

To run the notification mail services locally, update below listed properties in `application.properties` before running the project:

```ini
mail.enabled=
mail.sender.username=
mail.sender.password=
egov.localization.host=
egov.user.host=
email.subject=
```

- Update `mail.enabled` to true 
- Update the `mail.sender.username` with the senders username.
- Update the `mail.sender.password` with the senders password.