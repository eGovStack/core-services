package org.egov.enc.keymanagement.masterpassword.providers;

import org.egov.enc.keymanagement.masterpassword.MasterPasswordProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;

@Component
@Order(1)
@ConditionalOnProperty( value = "master.password.provider", havingValue = "awskms")
public class AwsKmsMasterPassword implements MasterPasswordProvider {


    @Value("${aws.kms.access.key:}")
    private String awsAccessKey;
    @Value("${aws.kms.secret.key:}")
    private String awsSecretKey;
    @Value("${aws.kms.region:}")
    private String awsRegion;

    @Value("${aws.kms.master.password.key.id:}")
    private String masterPasswordKeyId;


    @PostConstruct
    public void initializeConnection() {

    }

    @Override
    public String encryptWithMasterPassword(String key) throws Exception {
        return null;
    }

    @Override
    public String decryptWithMasterPassword(String encryptedKey) throws Exception {
        return null;
    }
}
