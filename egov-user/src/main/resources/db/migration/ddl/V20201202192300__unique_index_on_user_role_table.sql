DELETE   FROM eg_userrole_v1 v1
    USING       eg_userrole_v1 v2
WHERE  v1.ctid    < v2.ctid  and     -- delete the "older" ones
    v1.role_code = v2.role_code and
    v1.role_tenantid = v2.role_tenantid and
    v1.user_id = v2.user_id and
    v1.user_tenantid = v1.user_tenantid;

ALTER TABLE eg_userrole_v1
ADD CONSTRAINT idx_eg_userrole_v1_unique UNIQUE (role_code, role_tenantid, user_id, user_tenantid);
