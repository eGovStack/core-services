package org.egov.chat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@ComponentScan(basePackages = { "org.egov.chat" })
@SpringBootApplication
public class ChatBot {

    public static void main(String args[]) {
        SpringApplication.run(ChatBot.class, args);
    }

}
