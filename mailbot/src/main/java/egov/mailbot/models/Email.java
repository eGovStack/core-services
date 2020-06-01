package egov.mailbot.models;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class Email {

    public Date received;
    public String from;
    public List<String> to = new ArrayList<String>();
    public List<String> cc = new ArrayList<String>();
    public String subject;
    public String body;
    public List<EmailAttachment> attachments = new ArrayList<EmailAttachment>();
}

