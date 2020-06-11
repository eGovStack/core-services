package org.egov.filestore.domain.model;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@AllArgsConstructor
@Getter
public class Artifact {
	
	private String fileContentInString;
	
    private MultipartFile multipartFile;
    
    private FileLocation fileLocation;
}

