package org.egov.filestore.repository.impl.minio;

import java.net.MalformedURLException;
import java.net.URL;

import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import io.minio.MinioClient;
import io.minio.errors.InvalidEndpointException;
import io.minio.errors.InvalidPortException;
import lombok.extern.slf4j.Slf4j;

@Component
@ConditionalOnProperty(value = "minio.enabled", havingValue = "true", matchIfMissing = true)
@Slf4j
public class MinioClientFacade {

	@Autowired
	private MinioConfig minioConfig;
	
	
	@Bean
	private MinioClient getMinioClient() {
		log.info("Initializing the minio ");
		MinioClient	minioClient = null;
		try {
			URL url = new URL(minioConfig.getEndPoint());
			/*MinioClient client = new MinioClient(url, minioConfig.getAccessKey(), 
					minioConfig.getSecretKey());*/
			minioClient = new MinioClient(url, minioConfig.getAccessKey(), 
					minioConfig.getSecretKey());
			
		} catch (InvalidEndpointException | InvalidPortException e) {
			log.error(e.getMessage(), e);
			throw new CustomException("ERROR_FILESTORE_MINIO_INSTANCE","Failed to create minio instance");
		} catch (MalformedURLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return minioClient;
	} 
}
