package org.egov.chat.service.streams;

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
import org.egov.chat.models.ConversationState;
import org.egov.chat.models.EgovChat;
import org.egov.chat.models.LocalizationCode;
import org.egov.chat.models.Response;
import org.egov.chat.models.egovchatserdes.EgovChatSerdes;
import org.egov.chat.repository.MessageRepository;
import org.egov.chat.service.restendpoint.RestAPI;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Properties;

@Slf4j
@Component
public class CreateEndpointStream extends CreateStream {

    @Autowired
    private KafkaStreamsConfig kafkaStreamsConfig;
    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RestAPI restAPI;

    @Autowired
    private MessageRepository messageRepository;

    @Value("${contact.card.whatsapp.name}")
    private String nameInContactCard;

    @Value("${contact.card.whatsapp.number}")
    private String numberInContactCard;

    private String contactMessageLocalizationCode = "chatbot.messages.contactMessage";

    public void createEndpointStream(JsonNode config, String inputTopic, String sendMessageTopic) {

        String streamName = config.get("name").asText() + "-answer";

        Properties streamConfiguration = kafkaStreamsConfig.getDefaultStreamConfiguration();
        streamConfiguration.put(StreamsConfig.APPLICATION_ID_CONFIG, streamName);

        StreamsBuilder builder = new StreamsBuilder();
        KStream<String, EgovChat> answerKStream = builder.stream(inputTopic, Consumed.with(Serdes.String(),
                EgovChatSerdes.getSerde()));

        answerKStream.flatMapValues(chatNode -> {
            try {
                Response responseMessage = restAPI.makeRestEndpointCall(config, chatNode);

                chatNode.setResponse(responseMessage);

                String conversationId = chatNode.getConversationState().getConversationId();
                conversationStateRepository.markConversationInactive(conversationId);

                List<EgovChat> nodes = new ArrayList<>();
                nodes.add(chatNode);

                EgovChat contactMessageNode=createContactMessageNode(chatNode);
                if(contactMessageNode!=null)
                     nodes.add(contactMessageNode);

                return nodes;
            } catch (Exception e) {
                log.error(e.getMessage());
                return Collections.emptyList();
            }
        }).to(sendMessageTopic, Produced.with(Serdes.String(), EgovChatSerdes.getSerde()));

        kafkaStreamsConfig.startStream(builder, streamConfiguration);

        log.info("Endpoint Stream started : " + streamName + ", from : " + inputTopic + ", to : " + sendMessageTopic);
    }

    private EgovChat createContactMessageNode(EgovChat chatNode) {

        int recordcount = conversationStateRepository.getConversationStateCountForUserId(chatNode.getUser().getUserId());
        if(recordcount>1)
            return null;

        EgovChat contactMessageNode = chatNode.toBuilder().build();
        ObjectNode contactcard=objectMapper.createObjectNode();
        contactcard.put("number",nameInContactCard);
        contactcard.put("name",numberInContactCard);
        LocalizationCode localizationCode = LocalizationCode.builder().code(contactMessageLocalizationCode).build();
        Response response = Response.builder().timestamp(System.currentTimeMillis()).type("contactcard").contactCard(contactcard).localizationCodes(Collections.singletonList(localizationCode)).build();
        contactMessageNode.setResponse(response);
        return contactMessageNode;
    }

}
