# <eGov-Searcher>

Searcher is a core services in egov suite of services, it provides generic search for all the rest of the modules in the egov suite without having to make use of any platform based data models with only the help of yaml based configs. 

### DB UML Diagram



### Service Dependencies

- egov-user

### Swagger API Contract

Link to the swagger API contract yaml and editor link like below



## Service Details

Generic search provider for the egov suite. The service can be configured to provide search API for nay set of tables by providing yaml config for those. The searches uses json query from psql to extract table element directly as json rather than as a result set.

### API Details

The Api path will be constructed based on the inbformation provided in the yaml file. These following variables from the yaml file will form the API."/{moduleName}/{searchName}/_get")


### Kafka Consumers

### Kafka Producers
