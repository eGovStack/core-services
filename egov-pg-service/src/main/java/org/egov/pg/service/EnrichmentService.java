package org.egov.pg.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.pg.constants.PgConstants;
import org.egov.pg.models.AuditDetails;
import org.egov.pg.models.Transaction;
import org.egov.pg.repository.GatewayMetadata;
import org.egov.pg.web.models.TransactionRequest;
import org.egov.pg.web.models.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Collections;
import java.util.Objects;

import static java.util.Collections.singletonMap;

@Slf4j
@Service
public class EnrichmentService {

    private IdGenService idGenService;
    private ObjectMapper objectMapper;
    private GatewayMetadata gatewayMetadata;

    @Autowired
    EnrichmentService(IdGenService idGenService, ObjectMapper objectMapper, GatewayMetadata gatewayMetadata) {
        this.idGenService = idGenService;
        this.objectMapper = objectMapper;
        this.gatewayMetadata = gatewayMetadata;
    }

    void enrichCreateTransaction(TransactionRequest transactionRequest) throws Exception {
        Transaction transaction = transactionRequest.getTransaction();
        RequestInfo requestInfo = transactionRequest.getRequestInfo();

        // Generate ID from ID Gen service and assign to txn object
        String txnId = idGenService.generateTxnId(transactionRequest);
        transaction.setTxnId(txnId);
        transaction.setUser(new User(requestInfo.getUserInfo()));
        transaction.setTxnStatus(Transaction.TxnStatusEnum.PENDING);
        transaction.setTxnStatusMsg(PgConstants.TXN_INITIATED);

        if (Objects.isNull(transaction.getAdditionalDetails()))
            transaction.setAdditionalDetails(objectMapper.createObjectNode());

        ((ObjectNode) transaction.getAdditionalDetails()).set("taxAndPayments",
                objectMapper.valueToTree(transaction.getTaxAndPayments()));

        String uri = UriComponentsBuilder
                .fromHttpUrl(transaction.getCallbackUrl())
                .queryParams(new LinkedMultiValueMap<>(singletonMap(PgConstants.PG_TXN_IN_LABEL,
                        Collections.singletonList(txnId))))
                .build()
                .toUriString();
        transaction.setCallbackUrl(uri);

        AuditDetails auditDetails = AuditDetails.builder()
                .createdBy(requestInfo.getUserInfo() != null ? requestInfo.getUserInfo().getUuid() : null)
                .createdTime(System.currentTimeMillis())
                .build();
        transaction.setAuditDetails(auditDetails);
    }

    void enrichUpdateTransaction(TransactionRequest transactionRequest, Transaction newTxn) {
        RequestInfo requestInfo = transactionRequest.getRequestInfo();
        Transaction currentTxnStatus = transactionRequest.getTransaction();

        AuditDetails auditDetails = AuditDetails.builder()
                .createdBy(currentTxnStatus.getAuditDetails().getCreatedBy())
                .createdTime(currentTxnStatus.getAuditDetails().getCreatedTime())
                .lastModifiedBy(requestInfo.getUserInfo() != null ? requestInfo.getUserInfo().getUuid() : null)
                .lastModifiedTime(System.currentTimeMillis()).build();
        newTxn.setAuditDetails(auditDetails);

        newTxn.setTxnId(currentTxnStatus.getTxnId());
        newTxn.setGateway(currentTxnStatus.getGateway());
        newTxn.setBillId(currentTxnStatus.getBillId());
        newTxn.setProductInfo(currentTxnStatus.getProductInfo());
        newTxn.setTenantId(currentTxnStatus.getTenantId());
        newTxn.setUser(currentTxnStatus.getUser());
        newTxn.setAdditionalDetails(currentTxnStatus.getAdditionalDetails());
        newTxn.setTaxAndPayments(currentTxnStatus.getTaxAndPayments());
        newTxn.setConsumerCode(currentTxnStatus.getConsumerCode());
        newTxn.setTxnStatusMsg(currentTxnStatus.getTxnStatusMsg());
        newTxn.setReceipt(currentTxnStatus.getReceipt());

    }

}
