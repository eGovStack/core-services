package org.egov.enc.keymanagement.masterpassword;

public interface MasterPasswordProvider {

    public String encryptWithMasterPassword(String key) throws Exception;

    public String decryptWithMasterPassword(String encryptedKey) throws Exception;

}
