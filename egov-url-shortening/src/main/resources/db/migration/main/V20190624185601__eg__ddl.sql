DROP SEQUENCE IF EXISTS eg_url_shorter_id;
CREATE SEQUENCE eg_url_shorter_id;

CREATE TABLE "eg_url_shortener" (
	"id" VARCHAR(128) NOT NULL,
	"validform" bigint,
	"validto" bigint,
	"url"  VARCHAR(1024) NOT NULL,
    "created_by" character varying(64),
    "created_time" bigint,
    "last_modified_by" character varying(64),
    "last_modified_time" bigint,
	PRIMARY KEY ("id")
);
