package org.egov.infra.persist.consumer;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.egov.infra.persist.service.PersistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.listener.BatchMessageListener;
import org.springframework.stereotype.Service;

import java.util.LinkedList;
import java.util.List;

@Service
@Slf4j
public class PersisterBatchListner implements BatchMessageListener<String, Object> {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PersistService persistService;

    @Override
    public void onMessage(List<ConsumerRecord<String, Object>> dataList) {
        List<String> rcvDataList= new LinkedList<>();

            dataList.forEach(data -> {
                try {
                    rcvDataList.add(objectMapper.writeValueAsString(data.value()));
                }
                catch (JsonProcessingException e) {
                    log.error("Failed to serialize incoming message", e);
                }
            });
        // FIX ME NEEDS TO GROUP BY TOPIC
        persistService.persist(dataList.get(0).topic(),rcvDataList);
    }



}
