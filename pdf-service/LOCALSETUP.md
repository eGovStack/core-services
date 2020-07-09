# PDF-Service
###  PDF Generation Service
PDF service is one of the core application which is use to bulk generate the pdf as per requirement.

#### Requirement
- Prior knowledge of JavaScript.
- Prior knowledge of Node.js platform.
- Prior knowledge of Kubectl
- JSONPath for filtering required data from json objects.


### Local setup
1. To setup the pdf-service, clone the [Core Service repository](https://github.com/egovernments/core-services) and also clone the [config repository](https://github.com/egovernments/configs)
2. For locally running the pdf-service you have to make some changes in EnvironmentVariable.js 
    - Change 1: On line 4 replace the content with this 
                `process.env.EGOV_LOCALISATION_HOST || "https://egov-micro-dev.egovernments.org",`
                And on line 6 replace the content with this process.env   
                `EGOV_FILESTORE_SERVICE_HOST || "https://egov-micro-dev.egovernments.org",`
                you can mentoned the specific environment host or post forward the localisation and filestore service can mention the host with proper port number.
    - Change 2 : On line 23 replace the content with this 
                 `DATA_CONFIG_URLS: process.env.DATA_CONFIG_URLS || "file:///home/rohit/Downloads/SeweragePDF-data-config.json,file:///home/rohit/Downloads/water-conn-pdf-data-config.json” `
    - Change 3: On line 24 replace the content with this            
                `FORMAT_CONFIG_URLS: process.env.FORMAT_CONFIG_URLS || "file:///home/rohit/Downloads/SeweragePDF-format-config.json,file:///home/rohit/Downloads/water-conn-pdf-format-config.json”`
    Even if you are using windows machine path should contain `file:///` like `"file:///core-services/pdf-service/config/data/buildingpermit.json"`.
    Set the path on line 23 & 24 according to the path present in your system.

3. Go to the folder where pdf-service is present and run this command `npm install` or `sudo npm install --unsafe-perm=true` in terminal.
4. On same terminal run this command `npm run dev` and the check the log whether all the file loaded or not . if not then you have mentioned wrong path on line 23 & 24.
5. Open the postman, and hit this url `http://localhost:8081/pdf-service/v1/_createnosave?key=ws-consolidatedacknowlegment&tenantId=pb`
    - Make sure in body you have the correct object json for which you want to create the PDF. You should send the RequestInfo along with proper access token.
    - And in the service URL we have to pass the key value (which we are using in the config files) as the request param along with tenantId.
6. After hitting the above url, if status come as 201 created then your pdf is created you can download it by clicking on save response → save to a file 

### Note
1. Step 1,2 and 3 mention in local setup section has to do only one time, For running the pdf service again you have to start from step 4 to step 6.
2. You can create the format config files as per your requirement using this [link](http://pdfmake.org/playground.html). You can find many examples in that link to create the pdf.
3. If you want to get the dynamic values in formatConfig file from data config files you have to use the `{{value here}}` and the value we will fetch from data config file.
4. Those values which are mentioned in the format config should be configured in data config file.
5. In data config we should provide the key, baseKeyPath, entityIdPath. baseKeyPath path should be like `$.Bpa.*` ( if you are sending Bpa as array of object) or `$.Bpa` (if you are   
   sending Bpa as single object) and entityIdPath should be unique value in the response (which can be used as a key while searching the pdf)
6. If you are using the empty strings in config files you must use `“ ”` instead of `“”` as per the standards.
		Example : `text : “” (wrong)`
			      `text : “ ” (correct)`
7. If you want to get data from any other service then we have to mention the service within externalAPI(in data config). if you are using local service url then that should be port 
   forwarded using kubectl.









