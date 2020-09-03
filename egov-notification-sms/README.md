# egov-notification-sms service

Notification SMS service consumes SMS from the kafka notification topic and process them to send it to an third party service.

### DB UML Diagram

- NA

### Service Dependencies
- NA

### Swagger API Contract

- NA

## Service Details

This service is a consumer, which means it reads from the kafka queue and doesn’t provide facility to be accessed through API calls, there’s no REST layer here. The producers willing to integrate with this consumer will be posting a JSON  onto the topic configured at ‘kafka.topics.notification.sms.name’.
The notification-sms service reads from the queue and sends the sms to the mentioned phone number using one of the SMS providers configured. 

#### Error Handling

There are different topics to which the service will send messages. Below is a list of the same:

```ini
kafka.topics.backup.sms
kafka.topics.expiry.sms=egov.core.sms.expiry
kafka.topics.error.sms=egov.core.sms.error
```

In an event of a failure to send SMS, if `kafka.topics.backup.sms` is specified, then the message will be pushed on to that topic.

Any SMS which expire due to kafka lags, or some other internal issues, they will be passed to topic configured in `kafka.topics.expiry.sms`

If a `backup` topic has not been configured, then in an event of an error the same will be delivered to `kafka.topics.error.sms`

### Kafka Consumers
`egov.core.notification.sms` : egov-notification-sms listens to this topic to get the data


### Kafka Producers

- NA