package org.egov.filestore.persistence.repository;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.egov.filestore.domain.exception.ArtifactNotFoundException;
import org.egov.filestore.domain.model.FileInfo;
import org.egov.filestore.domain.model.FileLocation;
import org.egov.filestore.domain.model.Resource;
import org.egov.filestore.persistence.entity.Artifact;
import org.egov.filestore.repository.CloudFilesManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ArtifactRepository {

	private FileStoreJpaRepository fileStoreJpaRepository;
	@Autowired
	private AwsS3Repository s3Repository;

	@Autowired
	private CloudFilesManager cloudFilesManager;

	@Value("${isS3Enabled}")
	private Boolean isS3Enabled;

	@Value("${isAzureStorageEnabled}")
	private Boolean isAzureStorageEnabled;

	@Value("${source.s3}")
	private String awsS3Source;

	@Value("${source.azure.blob}")
	private String azureBlobSource;

	@Value("${source.disk}")
	private String diskFileStorage;

	public ArtifactRepository(FileStoreJpaRepository fileStoreJpaRepository) {

		this.fileStoreJpaRepository = fileStoreJpaRepository;
	}

	public List<String> save(List<org.egov.filestore.domain.model.Artifact> artifacts) {
		cloudFilesManager.saveFiles(artifacts);
		List<Artifact> artifactEntities = new ArrayList<>();
		artifacts.forEach(artifact -> {
			artifactEntities.add(mapToEntity(artifact));
		});
		return fileStoreJpaRepository.save(artifactEntities).stream().map(Artifact::getFileStoreId)
				.collect(Collectors.toList());
	}

	/**
	 * Converts POJO artifact to JPA Entity artifact
	 * 
	 * @param artifact
	 * @return
	 */
	private Artifact mapToEntity(org.egov.filestore.domain.model.Artifact artifact) {

		FileLocation fileLocation = artifact.getFileLocation();
		Artifact entityArtifact = Artifact.builder().fileStoreId(fileLocation.getFileStoreId())
				.fileName(fileLocation.getFileName()).contentType(artifact.getMultipartFile().getContentType())
				.module(fileLocation.getModule()).tag(fileLocation.getTag()).tenantId(fileLocation.getTenantId())
				.fileSource(fileLocation.getFileSource()).build();
		if (isAzureStorageEnabled)
			entityArtifact.setFileSource(azureBlobSource);
		if (isS3Enabled)
			entityArtifact.setFileSource(awsS3Source);

		return entityArtifact;
	}

	/*
	 * private List<Artifact>
	 * mapArtifactsListToEntitiesList(List<org.egov.filestore.domain.model.
	 * Artifact> artifacts) { return artifacts.stream() .map(this::mapToEntity)
	 * .collect(Collectors.toList()); }
	 * 
	 * private Artifact mapToEntity(org.egov.filestore.domain.model.Artifact
	 * artifact) {
	 * 
	 * FileLocation fileLocation = artifact.getFileLocation(); return
	 * Artifact.builder().fileStoreId(fileLocation.getFileStoreId()).fileName(
	 * fileLocation.getFileName())
	 * .contentType(artifact.getMultipartFile().getContentType()).module(
	 * fileLocation.getModule())
	 * .tag(fileLocation.getTag()).tenantId(fileLocation.getTenantId()).build();
	 * }
	 */
/**
 * 
 * @param fileStoreId
 * @param tenantId
 * @return
 * @throws IOException
 * This api needs to be enhanced to pick right object .All repositories should implement cloudmanager and it should provide 
 * simple get api too
 */
	public Resource find(String fileStoreId, String tenantId) throws IOException {
		Artifact artifact = fileStoreJpaRepository.findByFileStoreIdAndTenantId(fileStoreId, tenantId);
		if (artifact == null)
			throw new ArtifactNotFoundException(fileStoreId);

		org.springframework.core.io.Resource resource = null;
	if (artifact.getFileLocation().getFileSource().equals(diskFileStorage)) {
			// if only DiskFileStoreRepository use read else ignore
			DiskFileStoreRepository diskfileStore = (DiskFileStoreRepository) cloudFilesManager;
			resource = diskfileStore.read(artifact.getFileLocation());
		} else if (artifact.getFileLocation().getFileSource().equals(awsS3Source)) {
			 
		//	AwsS3Repository s3Repository = (AwsS3Repository) cloudFilesManager;
			resource = s3Repository.getObject(artifact.getFileLocation().getFileName());
	}
		 
      if(null!=resource)
		return new Resource(artifact.getContentType(), artifact.getFileName(), resource, artifact.getTenantId(),
				"" + resource.getFile().length() + " bytes");
      else
    	  return null;
	}

	public List<FileInfo> findByTag(String tag, String tenantId) {
		return fileStoreJpaRepository.findByTagAndTenantId(tag, tenantId).stream().map(this::mapArtifactToFileInfo)
				.collect(Collectors.toList());
	}

	private FileInfo mapArtifactToFileInfo(Artifact artifact) {
		FileLocation fileLocation = new FileLocation(artifact.getFileStoreId(), artifact.getModule(), artifact.getTag(),
				artifact.getTenantId(), artifact.getFileName(), artifact.getFileSource());

		return new FileInfo(artifact.getContentType(), fileLocation, artifact.getTenantId());
	}

	public List<Artifact> getByTenantIdAndFileStoreIdList(String tenantId, List<String> fileStoreIds) {
		return fileStoreJpaRepository.findByTenantIdAndFileStoreIdList(tenantId, fileStoreIds);
	}
}
