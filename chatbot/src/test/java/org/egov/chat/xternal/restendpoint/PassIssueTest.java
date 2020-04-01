package org.egov.chat.xternal.restendpoint;

import org.junit.Test;

import static org.junit.Assert.*;

public class PassIssueTest {

    @Test
    public void test() {
        String message = "Your application number APP-000220 for the <Pass Type> pass is submitted for approval. You " +
                "will receive notification when the approving authority has made its decision. ";

        message.replace("<Pass Type>", "passType");

        System.out.println(message);
    }

}