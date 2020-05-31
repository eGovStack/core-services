package org.egov.web.notification.mail.service;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;

import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.egov.web.notification.mail.config.ApplicationConfiguration;
import org.egov.web.notification.mail.consumer.contract.Email;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.File;
import java.io.IOException;
import java.net.URL;

@Service
@ConditionalOnProperty(value = "mail.enabled", havingValue = "true")
@Slf4j
public class ExternalEmailService implements EmailService {

	@Autowired
	private RestTemplate restTemplate;
	@Autowired
	private ApplicationConfiguration applicationConfiguration;

	public static final String EXCEPTION_MESSAGE = "Exception creating HTML email";
	private JavaMailSenderImpl mailSender;

    public ExternalEmailService(JavaMailSenderImpl mailSender) {
        this.mailSender = mailSender;
    }
    
    @Override
    public void sendEmail(Email email) {
		MimeMessage message = mailSender.createMimeMessage();
		MimeMessageHelper helper;
		File attachment = null;
		try {
			helper = new MimeMessageHelper(message, true);
			helper.setTo(email.getEmailTo().toArray(new String[0]));
			helper.setSubject(email.getSubject());
			helper.setText(email.getBody(), email.isHTML());
			if(email.getFileStoreId() != null) {
				attachment = getFileFromFileStoreId(email.getFileStoreId());
				helper.addAttachment(attachment.getName(), attachment);
				attachment.deleteOnExit();
			}
		} catch (MessagingException | IOException e) {
			log.error(EXCEPTION_MESSAGE, e);
			throw new RuntimeException(e);
		}
		mailSender.send(message);
		if(attachment != null)
			attachment.delete();
    }

	private File getFileFromFileStoreId(String fileStoreId) throws IOException {
		UriComponentsBuilder uriComponents =
				UriComponentsBuilder.fromUriString(applicationConfiguration.getFileStoreHost() + applicationConfiguration.getFileStoreGetEndpoint());
		uriComponents.queryParam("tenantId", applicationConfiguration.getStateTenantId());
		uriComponents.queryParam("fileStoreIds", fileStoreId);
		String url = uriComponents.buildAndExpand().toUriString();

		ResponseEntity<ObjectNode> response = restTemplate.getForEntity(url, ObjectNode.class);

		String fileURL = getRefinedFileURL(response.getBody().get(fileStoreId).asText());
		String filename = FilenameUtils.getName(fileURL);
		filename = filename.substring(13, filename.indexOf("?"));       // TODO : 13 characters set by fileStore service
		return getFileAt(fileURL, filename);
	}

	private String getRefinedFileURL(String fileURL) {
		if (fileURL.contains(",")) {             // TODO : Because fileStore service returns , separated list of files
			return fileURL.substring(0, fileURL.indexOf(","));
		}
		return fileURL;
	}

	public File getFileAt(String getLink, String filename) throws IOException {
		File tempFile = new File(filename);
		URL url = new URL(getLink);
		FileUtils.copyURLToFile(url, tempFile);
		return tempFile;
	}

}
