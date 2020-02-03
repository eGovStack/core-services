package org.egov.chat.repository;

import org.egov.chat.models.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class MessageRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private static final String insertMessageQuery = "INSERT INTO eg_chat_message (message_id, conversation_id, " +
            "node_id, raw_input, message_content, content_type, is_valid) VALUES (?, ?, ?, ?, ?, ?, ?)";

    private static final String selectValidMessagesOfConversationQuery = "SELECT * FROM eg_chat_message WHERE " +
            "conversation_id=? AND is_valid=true";

    public int insertMessage(Message message) {
        return jdbcTemplate.update(insertMessageQuery,
                message.getMessageId(),
                message.getConversationId(),
                message.getNodeId(),
                message.getRawInput(),
                message.getMessageContent(),
                message.getContentType(),
                message.isValid());
    }

    public List<Message> getValidMessagesOfConversation(String conversationId) {
        return jdbcTemplate.query(selectValidMessagesOfConversationQuery, new Object[] { conversationId },
                new BeanPropertyRowMapper<>(Message.class));
    }
}
