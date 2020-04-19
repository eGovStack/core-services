package org.egov.enc.services;

import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.egov.enc.config.AppProperties;
import org.egov.enc.keymanagement.KeyStore;
import org.egov.enc.models.Ciphertext;
import org.egov.enc.models.Plaintext;
import org.egov.enc.models.SymmetricKey;
import org.egov.enc.utils.SymmetricEncryptionUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.spec.InvalidKeySpecException;
import java.util.Base64;

@Service
public class SymmetricEncryptionService implements EncryptionServiceInterface {

    @Autowired
    private KeyStore keyStore;
    @Autowired
    private AppProperties appProperties;

    private SecureRandom secureRandom;

    @Autowired
    public SymmetricEncryptionService() {
        Security.addProvider(new BouncyCastleProvider());
        secureRandom = new SecureRandom();
    }

    public Ciphertext encrypt(Plaintext plaintext) throws NoSuchPaddingException, InvalidKeyException, NoSuchAlgorithmException, IllegalBlockSizeException, BadPaddingException, InvalidAlgorithmParameterException, InvalidKeySpecException {
        SymmetricKey symmetricKey = keyStore.getSymmetricKeyToEncrypt(plaintext);
        SecretKey secretKey = keyStore.getSecretKey(symmetricKey);

        byte[] initialVectorsBytes = new byte[appProperties.getInitialVectorSize()];
        secureRandom.nextBytes(initialVectorsBytes);

        byte[] cipherBytes = SymmetricEncryptionUtil.encrypt(plaintext.getPlaintext().getBytes(StandardCharsets.UTF_8), secretKey, initialVectorsBytes);

        Ciphertext ciphertext = new Ciphertext(symmetricKey.getKeyId(),
                Base64.getEncoder().encodeToString(initialVectorsBytes),
                Base64.getEncoder().encodeToString(cipherBytes));

        return ciphertext;
    }

    public Plaintext decrypt(Ciphertext ciphertext) throws NoSuchPaddingException, InvalidKeyException, NoSuchAlgorithmException, IllegalBlockSizeException, BadPaddingException, InvalidAlgorithmParameterException, InvalidKeySpecException {
        SymmetricKey symmetricKey = keyStore.getSymmetricKey(ciphertext.getKeyId());
        SecretKey secretKey = keyStore.getSecretKey(symmetricKey);

        byte[] initialVectorsBytes = Base64.getDecoder().decode(ciphertext.getInitialVector());

        byte[] plainBytes = SymmetricEncryptionUtil.decrypt(Base64.getDecoder().decode(ciphertext.getCiphertext()), secretKey, initialVectorsBytes);
        String plain = new String(plainBytes, StandardCharsets.UTF_8);

        Plaintext plaintext = new Plaintext(plain);

        return plaintext;
    }

}
