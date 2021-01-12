package org.egov.enc.keymanagement;

import lombok.Getter;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.egov.enc.config.AppProperties;
import org.egov.enc.keymanagement.masterkey.MasterKeyProvider;
import org.egov.enc.models.AsymmetricKey;
import org.egov.enc.models.MethodEnum;
import org.egov.enc.models.SymmetricKey;
import org.egov.enc.repository.KeyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.crypto.*;
import javax.crypto.spec.SecretKeySpec;
import java.security.*;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;



/*
    KeyStore fetches keys from database.
    All Keys will be stored inside the HashMaps.
    Keys can be extracted from these maps based on Key_ID.
    Active Key for a given Tenant can be got by providing Tenant_ID.
*/


@Component
@Order(2)
public class KeyStore implements ApplicationRunner {

    @Autowired
    private AppProperties appProperties;
    @Autowired
    private KeyRepository keyRepository;
    @Getter
    private ArrayList<String> tenantIds;

    @Autowired
    private MasterKeyProvider masterKeyProvider;

    private static ArrayList<SymmetricKey> symmetricKeys;
    private static ArrayList<AsymmetricKey> asymmetricKeys;

    private static HashMap<Integer, SymmetricKey> symmetricKeyHashMap;
    private static HashMap<Integer, AsymmetricKey> asymmetricKeyHashMap;

    private static HashMap<String, Integer> activeSymmetricKeys;
    private static HashMap<String, Integer> activeAsymmetricKeys;

    @Autowired
    public KeyStore()  {
        Security.addProvider(new BouncyCastleProvider());
    }

    //Reset and Initialize all the keys and HashMaps from the database
    public void refreshKeys() throws Exception {
        tenantIds = (ArrayList<String>) keyRepository.fetchDistinctTenantIds();

        symmetricKeys = (ArrayList<SymmetricKey>) this.keyRepository.fetchSymmetricKeys();
        asymmetricKeys = (ArrayList<AsymmetricKey>) this.keyRepository.fetchAsymmtericKeys();

        decryptAllKeys();

        symmetricKeyHashMap = new HashMap<>();
        asymmetricKeyHashMap = new HashMap<>();

        initializeKeys();

        activeSymmetricKeys = new HashMap<>();
        activeAsymmetricKeys = new HashMap<>();

        initializeActiveKeys();
    }


    //Create HashMap to store keys indexed with keyId
    private void initializeKeys() {
        for(SymmetricKey symmetricKey : symmetricKeys) {
            symmetricKeyHashMap.put(symmetricKey.getKeyId(), symmetricKey);
        }
        for(AsymmetricKey asymmetricKey : asymmetricKeys) {
            asymmetricKeyHashMap.put(asymmetricKey.getKeyId(), asymmetricKey);
        }
    }

    //Create HashMap to store active keys indexed with tenantId
    private void initializeActiveKeys() {

        for(String tenant : tenantIds) {
            for(SymmetricKey symmetricKey : symmetricKeys) {
                if(symmetricKey.getTenantId().equalsIgnoreCase(tenant) && symmetricKey.isActive()) {
                    activeSymmetricKeys.put(tenant, symmetricKey.getKeyId());
                    break;
                }
            }

            for(AsymmetricKey asymmetricKey : asymmetricKeys) {
                if(asymmetricKey.getTenantId().equalsIgnoreCase(tenant) && asymmetricKey.isActive()) {
                    activeAsymmetricKeys.put(tenant, asymmetricKey.getKeyId());
                    break;
                }
            }
        }
    }

    //Get currently active symmetric key for given tenanId
    public SymmetricKey getSymmetricKey(String tenantId) {
        return getSymmetricKey(activeSymmetricKeys.get(tenantId));
    }

    //Get currently active asymmetric key for given tenanId
    public AsymmetricKey getAsymmetricKey(String tenantId) {
        return getAsymmetricKey(activeAsymmetricKeys.get(tenantId));
    }

    //Get symmetric key based on given keyId
    public SymmetricKey getSymmetricKey(int keyId) {
        return symmetricKeyHashMap.get(keyId);
    }

    //Get asymmetric key based on given keyId
    public AsymmetricKey getAsymmetricKey(int keyId) {
        return asymmetricKeyHashMap.get(keyId);
    }


    //Return type of encryption method based on key id
    public MethodEnum getTypeOfKey(Integer keyId) {
        if(symmetricKeyHashMap.containsKey(keyId)) {
            return MethodEnum.SYM;
        } else {
            return MethodEnum.ASY;
        }
    }


    //Generate Secret Key to be used by AES from custom object SymmetricKey
    public SecretKey getSecretKey(SymmetricKey symmetricKey) {
        String encodedKey = symmetricKey.getSecretKey();
        byte[] decodedKey = Base64.getDecoder().decode(encodedKey);
        return new SecretKeySpec(decodedKey, "AES");
    }

    //Generate PublicKey to be used by RSA from custom object AsymmetricKey
    public PublicKey getPublicKey(AsymmetricKey asymmetricKey) throws NoSuchAlgorithmException, InvalidKeySpecException {
        String encodedPublicKey = asymmetricKey.getPublicKey();
        byte[] decodedPublicKey = Base64.getDecoder().decode(encodedPublicKey);

        X509EncodedKeySpec keySpec = new X509EncodedKeySpec(decodedPublicKey);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        return keyFactory.generatePublic(keySpec);
    }

    //Generate PrivateKey to be used by RSA from custom object AsymmetricKey
    public PrivateKey getPrivateKey(AsymmetricKey asymmetricKey) throws NoSuchAlgorithmException, InvalidKeySpecException {
        String encodedPrivateKey = asymmetricKey.getPrivateKey();
        byte[] decodedPrivateKey = Base64.getDecoder().decode(encodedPrivateKey);

        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(decodedPrivateKey);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        return keyFactory.generatePrivate(keySpec);
    }

    //Generate Initial Vecctor to be used by AES from custom object SymmetricKey
    public byte[] getInitialVector(SymmetricKey symmetricKey) {
        return Base64.getDecoder().decode(symmetricKey.getInitialVector());
    }

    //Decrypt all keys
    private void decryptAllKeys() throws Exception {
        for (SymmetricKey symmetricKey : symmetricKeys) {
            symmetricKey.setSecretKey(masterKeyProvider.decryptWithMasterPassword(symmetricKey.getSecretKey()));
            symmetricKey.setInitialVector(masterKeyProvider.decryptWithMasterPassword(symmetricKey.getInitialVector()));
        }
        for (AsymmetricKey asymmetricKey : asymmetricKeys) {
            asymmetricKey.setPublicKey(masterKeyProvider.decryptWithMasterPassword(asymmetricKey.getPublicKey()));
            asymmetricKey.setPrivateKey(masterKeyProvider.decryptWithMasterPassword(asymmetricKey.getPrivateKey()));
        }
    }


    //Initialize keys after application has finished loading
    @Override
    public void run(ApplicationArguments applicationArguments) throws Exception {
        refreshKeys();
    }

    public ArrayList<Integer> getKeyIds() {
        ArrayList<Integer> keyIds = new ArrayList<>();
        keyIds.addAll(symmetricKeyHashMap.keySet());
        keyIds.addAll(asymmetricKeyHashMap.keySet());
        return keyIds;
    }

}
