package org.egov.chat.xternal.responseformatter.ValueFirst;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.StreamsConfig;
import org.apache.kafka.streams.kstream.Consumed;
import org.apache.kafka.streams.kstream.KStream;
import org.apache.kafka.streams.kstream.Produced;
import org.egov.chat.config.KafkaStreamsConfig;
import org.egov.chat.post.formatter.ChatNodeJsonPointerConstants;
import org.egov.chat.util.LocalizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import javax.annotation.PostConstruct;
import java.util.Collections;
import java.util.Properties;

@PropertySource("classpath:xternal.properties")
@Slf4j
public class WhatsAppUserLimitSMS {

    @Value("${elasticsearch.url}")
    private String elasticsearchUrl;
    @Value("${elasticsearch.chatbot.index.name}")
    private String elasticsearchChatbotIndexName;
    @Value("${elasticsearch.search.endpoint}")
    private String elasticsearchSearchEndpoint;

    @Value("${whatsapp.unique.user.limit}")
    private Integer uniqueUsersLimit;
    @Value("${whatsapp.user.limit.sms.localization.code}")
    private String localizationCode;
    @Value("${send.sms.topic.name}")
    private String sendSMSTopicName;

    @Autowired
    private LocalizationService localizationService;
    @Autowired
    private KafkaStreamsConfig kafkaStreamsConfig;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private RestTemplate restTemplate;

    private String inputTopic = "send-message-localized";


    public String getStreamName() {
        return "whatsapp-user-limit-stream";
    }

    @PostConstruct
    public void startStream() {
        Properties streamConfiguration = kafkaStreamsConfig.getDefaultStreamConfiguration();
        streamConfiguration.put(StreamsConfig.APPLICATION_ID_CONFIG, getStreamName());
        StreamsBuilder builder = new StreamsBuilder();
        KStream<String, JsonNode> messagesKStream = builder.stream(inputTopic, Consumed.with(Serdes.String(),
                kafkaStreamsConfig.getJsonSerde()));

        messagesKStream.flatMapValues( chatNode -> {
            if(isLimitExceeded()) {
                return createSMSNode(chatNode);
            } else {
                return Collections.emptyList();
            }
        }).to(sendSMSTopicName, Produced.with(Serdes.String(), kafkaStreamsConfig.getJsonSerde()));

    }

    private JsonNode createSMSNode(JsonNode chatNode) {
        ObjectNode smsNode = objectMapper.createObjectNode();
        String mobileNumber = chatNode.at(ChatNodeJsonPointerConstants.toMobileNumber).asText();
        String smsContent = localizationService.getMessageForCode(localizationCode);
        smsNode.put("mobileNumber", mobileNumber);
        smsNode.put("message", smsContent);
        return smsNode;
    }

    private boolean isLimitExceeded() {
        String uniqueUserCountQuery = "{\"size\":0,\"aggs\":{\"unique_users\":{\"cardinality\":{\"field\":\"user" +
                ".userId.keyword\"}}},\"query\":{\"bool\":{\"filter\":[{\"match_phrase\":{\"extraInfo.missedCall\":{\"query\":true}}}," +
                "{\"range\":{\"@timestamp\":{\"gte\":\"now-24h\",\"lt\":\"now\"}}}]}}}";

        try {
            JsonNode request = objectMapper.readTree(uniqueUserCountQuery);

            String url = elasticsearchUrl + elasticsearchChatbotIndexName + elasticsearchSearchEndpoint;

            ResponseEntity<JsonNode> responseEntity = restTemplate.postForEntity(url, request, JsonNode.class);

            int numberOfUsers = responseEntity.getBody().at("/aggregations/unique_users/value").asInt();

            if(numberOfUsers > uniqueUsersLimit)
                return true;

        } catch (Exception e) {
            log.info("Error while querying ES Chatbot index : ", e);
        }
        return false;
    }

}
