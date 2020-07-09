# PDF-Service
###  PDF Generation Service
PDF service is one of the core application which is use to bulk generate the pdf as per requirement.

### Funcatinality
1. Provide common framework to generate PDF.
2. Provide flexibility to customize the PDF as per the requirement.
3. Provide functionality to add an image, Qr Code in PDF.
4. Provide functionality to generate pdf in bulk.
5. Provide functionality to specify maximum number of records to be written in one PDF.

### Feature
1. Functionality to generate PDFs in bulk.
2. Avoid regeneration.
3. Support QR codes.
4. Uploading generated PDF to filestore and return filestore id for easy access.
5. For large request generate PDF in multiple files due to upload size restriction by file-store service.
6. Supports localisation.

### External Libraries Used
[PDFMake](https://github.com/bpampuch/pdfmake):- for generating PDFs

[Mustache.js](https://github.com/janl/mustache.js/ ):- as templating engine to populate format as defined in format config, from request json based on mappings defined in data config

### Configuration
PDF service use two config files for a pdf generation as per requirement
- Format Config File: It define format as per PDFMake syntax of pdf 
- Data Config File : It use to fill format of pdf to prepare final object which will go to PDFMake and will be converted into PDF.
This pdf will be upload to the file store. PDF generation service read these such files at start-up to support PDF generation for all configured module.
[Sample format config](https://github.com/egovernments/configs/blob/master/pdf-service/format-config/tl-receipt.json) and [Sample data config](https://github.com/egovernments/configs/blob/master/pdf-service/data-config/tl-receipt.json)