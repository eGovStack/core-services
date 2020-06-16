package org.egov.filestore.web.controller;

import static org.springframework.http.MediaType.APPLICATION_JSON_UTF8_VALUE;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.apache.tika.Tika;
import org.egov.filestore.config.FileStoreConfig;
import org.egov.filestore.domain.model.FileInfo;
import org.egov.filestore.domain.service.StorageService;
import org.egov.filestore.web.contract.File;
import org.egov.filestore.web.contract.FileStoreResponse;
import org.egov.filestore.web.contract.GetFilesByTagResponse;
import org.egov.filestore.web.contract.ResponseFactory;
import org.egov.filestore.web.contract.StorageResponse;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.multipart.MultipartFile;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping("/v1/files")
@Slf4j
public class StorageController {

	private StorageService storageService;
	private ResponseFactory responseFactory;
	private FileStoreConfig fileStoreConfig;

	@Autowired
	public StorageController(StorageService storageService, ResponseFactory responseFactory, FileStoreConfig fileStoreConfig) {
		this.storageService = storageService;
		this.responseFactory = responseFactory;
		this.fileStoreConfig = fileStoreConfig;
	}

	@GetMapping("/id")
	@ResponseBody
	public ResponseEntity<Resource> getFile(@RequestParam(value = "tenantId") String tenantId,
			@RequestParam("fileStoreId") String fileStoreId) {
		org.egov.filestore.domain.model.Resource resource =null;
		try {
			resource = storageService.retrieve(fileStoreId, tenantId);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		String fileName=resource.getFileName().substring(resource.getFileName().lastIndexOf('/')+1,resource.getFileName().length());
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" +fileName  + "\"")
				.header(HttpHeaders.CONTENT_TYPE, resource.getContentType()).body(resource.getResource());
	}

	@GetMapping("/metadata")
	@ResponseBody
	public ResponseEntity<org.egov.filestore.domain.model.Resource> getMetaData(
			@RequestParam(value = "tenantId") String tenantId, @RequestParam("fileStoreId") String fileStoreId) {
		org.egov.filestore.domain.model.Resource resource =null;
		try {
		    resource = storageService.retrieve(fileStoreId, tenantId);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		resource.setResource(null);
		return new ResponseEntity<>(resource, HttpStatus.OK);
	}

	@GetMapping(value = "/tag", produces = APPLICATION_JSON_UTF8_VALUE)
	@ResponseBody
	public GetFilesByTagResponse getUrlListByTag(@RequestParam(value = "tenantId") String tenantId,
			@RequestParam("tag") String tag) {
		final List<FileInfo> fileInfoList = storageService.retrieveByTag(tag, tenantId);
		return responseFactory.getFilesByTagResponse(fileInfoList);
	}

	@PostMapping(produces = APPLICATION_JSON_UTF8_VALUE)
	@ResponseStatus(HttpStatus.CREATED)
	@ResponseBody
	public StorageResponse storeFiles(@RequestParam("file") List<MultipartFile> files,
			@RequestParam(value = "tenantId") String tenantId,
			@RequestParam(value = "module", required = true) String module,
			@RequestParam(value = "tag", required = false) String tag) {
		
		Map<String, List<String>> allowedFormatsMap = fileStoreConfig.getAllowedFormatsMap();
		Set<String> keySet = fileStoreConfig.getAllowedKeySet();
		String inputStreamAsString = null;
		String inputFormat = null;
		for(MultipartFile file : files) {
			
			String extension = FilenameUtils.getExtension(file.getOriginalFilename());
			if(!allowedFormatsMap.containsKey(extension)) {
				throw new CustomException("EG_FILESTORE_INVALID_INPUT","Inalvid input provided for file : " + extension + ", please upload any of the allowed formats : " + keySet);
			}
			Tika tika = new Tika();
			
			try {
				
				inputStreamAsString = IOUtils.toString(file.getInputStream(), fileStoreConfig.getImageCharsetType());
				InputStream ipStreamForValidation = IOUtils.toInputStream(inputStreamAsString, fileStoreConfig.getImageCharsetType());
				inputFormat = tika.detect(ipStreamForValidation);
				log.info(" the file format is : " + inputFormat);
				ipStreamForValidation.close();
			} catch (IOException e) {
				throw new CustomException("EG_FILESTORE_PARSING_ERROR","not able to parse the input please upload a proper file of allowed type : " + e.getMessage());
			}
			
			
			
			if (!allowedFormatsMap.get(extension).contains(inputFormat)) {
				throw new CustomException("EG_FILESTORE_INVALID_INPUT", "Inalvid input provided for file, the extension does not match the file format. Please upload any of the allowed formats : "
								+ keySet);
			}
		}

		final List<String> fileStoreIds = storageService.save(files, module, tag, tenantId, inputStreamAsString);
		return getStorageResponse(fileStoreIds, tenantId);
	}

	private StorageResponse getStorageResponse(List<String> fileStorageIds, String tenantId) {
		List<File> files = new ArrayList<>();
		for (String fileStorageId : fileStorageIds) {
			File f = new File(fileStorageId, tenantId);
			files.add(f);
		}
		return new StorageResponse(files);
	}
	
	@GetMapping("/url")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> getUrls(@RequestParam(value = "tenantId") String tenantId,
			@RequestParam("fileStoreIds") List<String> fileStoreIds) {
		
		Map<String, Object> responseMap = new HashMap<>();
		if (fileStoreIds.isEmpty())
			return new ResponseEntity<>(new HashMap<>(), HttpStatus.OK);
			Map<String, String> maps= storageService.getUrls(tenantId, fileStoreIds);
			
		List<FileStoreResponse> responses = new ArrayList<>();
		for (Entry<String, String> entry : maps.entrySet()) {

			responses.add(FileStoreResponse.builder().id(entry.getKey()).url(entry.getValue()).build());
		}
		responseMap.putAll(maps);
		responseMap.put("fileStoreIds", responses);
		
		return new ResponseEntity<>(responseMap, HttpStatus.OK);
	}
	
}
