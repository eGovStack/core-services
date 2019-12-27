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
            "node_id, message_content, content_type) VALUES (?, ?, ?, ?, ?)";

    private static final String selectMessagesOfConversationQuery = "SELECT * FROM eg_chat_message WHERE " +
            "conversation_id=?";

    public int insertMessage(Message message) {
        return jdbcTemplate.update(insertMessageQuery,
                message.getMessageId(),
                message.getConversationId(),
                message.getNodeId(),
                message.getMessageContent(),
                message.getContentType());
    }

    public List<Message> getMessagesOfConversation(String conversationId) {
        return jdbcTemplate.query(selectMessagesOfConversationQuery, new Object[] { conversationId },
                new BeanPropertyRowMapper<>(Message.class));
    }
}
