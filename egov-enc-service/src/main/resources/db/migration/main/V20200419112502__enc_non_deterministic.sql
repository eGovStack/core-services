DROP INDEX IF EXISTS active_tenant_symmetric_keys;
DROP INDEX IF EXISTS active_tenant_asymmetric_keys;

ALTER TABLE eg_enc_symmetric_keys DROP COLUMN initial_vector;
