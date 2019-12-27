package org.egov.chat.repository.querybuilder;

import com.fasterxml.jackson.databind.JsonNode;
import org.egov.tracer.model.CustomException;
import org.postgresql.util.PGobject;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;

import java.sql.SQLException;
import java.util.Objects;

public class ConversationStateQueryBuilder {

    public static final String UPDATE_CONVERSATION_STATE_QUERY = "UPDATE eg_chat_conversation_state SET " +
            "active_node_id = :active_node_id , question_details = :question_details " +
            "WHERE conversation_id = :conversation_id";

    public static MapSqlParameterSource getParametersForConversationStateUpdate(String activeNodeId, JsonNode questionDetails, String conversationId) {
        MapSqlParameterSource sqlParameterSource = new MapSqlParameterSource();

        sqlParameterSource.addValue("conversation_id", conversationId);
        sqlParameterSource.addValue("active_node_id", activeNodeId);
        sqlParameterSource.addValue("question_details", getJsonb(questionDetails));

        return sqlParameterSource;
    }

    private static PGobject getJsonb(JsonNode node) {
        if (Objects.isNull(node))
            return null;

        PGobject pgObject = new PGobject();
        pgObject.setType("jsonb");
        try {
            pgObject.setValue(node.toString());
            return pgObject;
        } catch (SQLException e) {
            throw new CustomException("UNABLE_TO_CREATE_RECEIPT", "Invalid JSONB value provided");
        }

    }

}
