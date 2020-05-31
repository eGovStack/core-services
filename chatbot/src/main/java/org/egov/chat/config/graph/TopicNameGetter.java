package org.egov.chat.config.graph;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TopicNameGetter {

    @Value("${topic.name.prefix}")
    private String topicNamePrefix;
    @Autowired
    private GraphReader graphReader;

    public String getQuestionTopicNameForNode(String nodeName) {
        return topicNamePrefix + nodeName + "-question";
    }

    public String getAnswerInputTopicNameForNode(String nodeName) {
        return topicNamePrefix + nodeName + "-answer";
    }

    public String getAnswerOutputTopicNameForNode(String nodeName) {
        List<String> nextNodes = graphReader.getNextNodes(nodeName);
        if (nextNodes.size() == 1)
            return topicNamePrefix + nextNodes.get(0) + "-question";
        if (nextNodes.size() == 0)
            return topicNamePrefix + nodeName + "-end";
        return null;
    }
}
