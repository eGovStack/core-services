package org.egov.filestore.repository.impl.minio;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import lombok.Getter;

@Configuration
@Getter
public class MinioConfig {
	
	@Value("${minio.url}")
	private String endPoint;

	@Value("${minio.secret.key}")
	private String secretKey;

	@Value("${minio.access.key}")
	private String accessKey;
	
	@Value("${minio.bucket.name}")
	private String bucketName;
	
	@Value("${minio.source}")
	private String source;

}
