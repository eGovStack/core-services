package org.egov.filestore.persistence.repository;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Paths;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.imageio.ImageIO;

import org.apache.commons.io.FilenameUtils;
import org.egov.filestore.domain.model.FileLocation;
import org.egov.filestore.persistence.entity.Artifact;
import org.egov.filestore.repository.CloudFilesManager;
import org.egov.tracer.model.CustomException;
import org.imgscalr.Scalr;
import org.imgscalr.Scalr.Method;
import org.imgscalr.Scalr.Mode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import io.minio.MinioClient;
import io.minio.PutObjectOptions;
import io.minio.errors.ErrorResponseException;
import io.minio.errors.InsufficientDataException;
import io.minio.errors.InternalException;
import io.minio.errors.InvalidBucketNameException;
import io.minio.errors.InvalidEndpointException;
import io.minio.errors.InvalidExpiresRangeException;
import io.minio.errors.InvalidPortException;
import io.minio.errors.InvalidResponseException;
import io.minio.errors.MinioException;
import io.minio.errors.RegionConflictException;
import io.minio.errors.XmlParserException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@ConditionalOnProperty(value = "minio.enabled", havingValue = "true")
public class MinioRepository implements CloudFilesManager {

	private static final String ERROR_IN_CONFIGURATION = "Error in Configuration";

	MinioClient minioClient;

	@Value("${minio.url}")
	private String endPoint;

	@Value("${minio.secret.key}")
	private String secretKey;

	@Value("${minio.access.key}")
	private String accessKey;

	@Value("${minio.bucket.name}")
	private String bucketName;

	@Value("${image.small.width}")
	private Integer smallWidth;

	@Value("${image.medium.width}")
	private Integer mediumWidth;

	@Value("${image.large.width}")
	private Integer largeWidth;

	private static String sourceType = "minio";

	@Override
	public void saveFiles(List<org.egov.filestore.domain.model.Artifact> artifacts) {

		List<org.egov.filestore.persistence.entity.Artifact> persistList = new ArrayList<>();
		artifacts.forEach(artifact -> {
			MultipartFile multipartFile = artifact.getMultipartFile();
			FileLocation fileLocation = artifact.getFileLocation();
			createBucket();
			String completeName = fileLocation.getFileName();
			int index = completeName.indexOf('/');
			String fileNameWithPath = completeName.substring(index + 1, completeName.length());
			if (multipartFile.getContentType().startsWith("image/"))
				writeImage(multipartFile, fileNameWithPath);
			else
				push(multipartFile, fileNameWithPath);
		
			fileLocation.setFileSource(sourceType);
			persistList.add(mapToEntity(artifact));

		});
	}

	private void createBucket() {

		try {

			boolean isExist = getMinioClient().bucketExists(bucketName);
			if (!isExist)
				getMinioClient().makeBucket(bucketName);

		} catch (InvalidKeyException | ErrorResponseException | IllegalArgumentException | InsufficientDataException
				| InternalException | InvalidBucketNameException | InvalidResponseException | NoSuchAlgorithmException
				| XmlParserException | RegionConflictException | IOException e) {
			log.error(e.getMessage(), e);
			throw new RuntimeException(ERROR_IN_CONFIGURATION);
		}

	}

	private MinioClient getMinioClient() {
		try {
			if (minioClient == null)
				minioClient=new  MinioClient(endPoint, accessKey, secretKey);
			return minioClient;
		} catch (InvalidEndpointException | InvalidPortException e) {
			log.error(e.getMessage(), e);
			throw new RuntimeException(ERROR_IN_CONFIGURATION);

		}
	}

	private void push(MultipartFile multipartFile, String fileNameWithPath) {
		try {
			InputStream is = multipartFile.getInputStream();
			long contentLength = multipartFile.getSize();
			PutObjectOptions putObjectOptions = new PutObjectOptions(contentLength, PutObjectOptions.MAX_PART_SIZE);
			putObjectOptions.setContentType(multipartFile.getContentType());
			getMinioClient().putObject(bucketName, fileNameWithPath, is, putObjectOptions);
			log.debug("Upload Successful");

		} catch (MinioException | InvalidKeyException | IllegalArgumentException | NoSuchAlgorithmException
				| IOException e) {
			log.error("Error occurred: " + e);
			throw new RuntimeException(ERROR_IN_CONFIGURATION);
		}

	}

	private void push(InputStream is, long contentLength, String contentType, String fileNameWithPath) {
		try {
			PutObjectOptions putObjectOptions = new PutObjectOptions(contentLength, PutObjectOptions.MAX_PART_SIZE);
			putObjectOptions.setContentType(contentType);
			getMinioClient().putObject(bucketName, fileNameWithPath, is, putObjectOptions);
			log.debug("Upload Successful");

		} catch (MinioException | InvalidKeyException | IllegalArgumentException | NoSuchAlgorithmException
				| IOException e) {
			log.error("Error occurred: " + e);
			throw new RuntimeException(ERROR_IN_CONFIGURATION);
		}

	}

	private void writeImage(MultipartFile file, String fileName) {

		try {
			log.debug(" the file name " + file.getName());
			log.debug(" the file size " + file.getSize());
			log.debug(" the file content " + file.getContentType());

			BufferedImage originalImage = ImageIO.read(file.getInputStream());

			if (null == originalImage) {
				Map<String, String> map = new HashMap<>();
				map.put("Image Source Unavailable", "Image File present in upload request is Invalid/Not Readable");
				throw new CustomException(map);
			}

			BufferedImage largeImage = Scalr.resize(originalImage, Method.QUALITY, Mode.AUTOMATIC, mediumWidth, null,
					Scalr.OP_ANTIALIAS);
			BufferedImage mediumImg = Scalr.resize(originalImage, Method.QUALITY, Mode.AUTOMATIC, mediumWidth, null,
					Scalr.OP_ANTIALIAS);
			BufferedImage smallImg = Scalr.resize(originalImage, Method.QUALITY, Mode.AUTOMATIC, smallWidth, null,
					Scalr.OP_ANTIALIAS);

			int lastIndex = fileName.length();
			String replaceString = fileName.substring(fileName.lastIndexOf('.'), lastIndex);
			String extension = FilenameUtils.getExtension(file.getOriginalFilename());
			String largePath = fileName.replace(replaceString, "_large" + replaceString);
			String mediumPath = fileName.replace(replaceString, "_medium" + replaceString);
			String smallPath = fileName.replace(replaceString, "_small" + replaceString);

			ByteArrayOutputStream os = new ByteArrayOutputStream();
			ImageIO.write(originalImage, extension, os);
			byte[] byteArray = os.toByteArray();
			ByteArrayInputStream is = new ByteArrayInputStream(byteArray);
			push(is, byteArray.length, file.getContentType(), fileName);

			os = new ByteArrayOutputStream();
			ImageIO.write(largeImage, extension, os);
			byteArray = os.toByteArray();
			is = new ByteArrayInputStream(byteArray);
			push(is, byteArray.length, file.getContentType(), largePath);

			os = new ByteArrayOutputStream();
			ImageIO.write(mediumImg, extension, os);
			byteArray = os.toByteArray();
			is = new ByteArrayInputStream(byteArray);
			push(is, byteArray.length, file.getContentType(), mediumPath);

			os = new ByteArrayOutputStream();
			ImageIO.write(smallImg, extension, os);
			byteArray = os.toByteArray();
			is = new ByteArrayInputStream(byteArray);
			push(is, byteArray.length, file.getContentType(), smallPath);

			largeImage.flush();
			smallImg.flush();
			mediumImg.flush();
			originalImage.flush();

		} catch (Exception ioe) {

			Map<String, String> map = new HashMap<>();
			log.error("Exception while uploading the image: ", ioe);
			map.put("ERROR_MINIO_UPLOAD", "An error has occured while trying to upload image to filestore system .");
			throw new CustomException(map);
		}
	}

	@Override
	public Map<String, String> getFiles(Map<String, String> mapOfIdAndFilePath) {

		Map<String, String> mapOfIdAndSASUrls = new HashMap<>();
		for (String s : mapOfIdAndFilePath.keySet()) {

			String objectUrl;
			try {
				String name = mapOfIdAndFilePath.get(s);
				String fileName=name.substring(name.indexOf('/')+1,name.length());
				objectUrl = getMinioClient().getPresignedObjectUrl(io.minio.http.Method.GET,bucketName, fileName, 60*60*30,new HashMap<String,String>());
				StringBuilder url = new StringBuilder(objectUrl);
				mapOfIdAndSASUrls.put(s, url.toString());
			} catch (InvalidKeyException | ErrorResponseException | IllegalArgumentException | InsufficientDataException
					| InternalException | InvalidBucketNameException | InvalidResponseException
					| NoSuchAlgorithmException | XmlParserException | IOException | InvalidExpiresRangeException e) {

			}

		}

		return mapOfIdAndSASUrls;
	}

	public Resource read(FileLocation fileLocation) {

		Resource resource = null;
		File f = new File(fileLocation.getFileStoreId());

		if (fileLocation.getFileSource() == null || fileLocation.getFileSource().equals(sourceType)) {
			String fileName=fileLocation.getFileName().substring(fileLocation.getFileName().indexOf('/')+1,fileLocation.getFileName().length());

			try {
				getMinioClient().getObject(bucketName,fileName , f.getName());
			} catch (InvalidKeyException | ErrorResponseException | IllegalArgumentException | InsufficientDataException
					| InternalException | InvalidBucketNameException | InvalidResponseException
					| NoSuchAlgorithmException | XmlParserException | IOException e) {
				log.error("Error while downloading the file ", e);
				Map<String, String> map = new HashMap<>();
				map.put("ERROR_MINIO_DOWNLOAD", "An error has occured while trying to download image from filestore system .");
				throw new CustomException(map);

			}

			resource = new FileSystemResource(Paths.get(f.getPath()).toFile());

		}
		return resource;
	}

	private Artifact mapToEntity(org.egov.filestore.domain.model.Artifact artifact) {

		FileLocation fileLocation = artifact.getFileLocation();
		return Artifact.builder().fileStoreId(fileLocation.getFileStoreId()).fileName(fileLocation.getFileName())
				.contentType(artifact.getMultipartFile().getContentType()).module(fileLocation.getModule())
				.tag(fileLocation.getTag()).tenantId(fileLocation.getTenantId())
				.fileSource(fileLocation.getFileSource()).build();
	}

}
