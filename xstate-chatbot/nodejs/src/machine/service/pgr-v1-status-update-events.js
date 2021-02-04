const config = require('../../env-variables');
const localisationService = require('../util/localisation-service');
const urlencode = require('urlencode');
const valueFirst = require('../../channel/value-first');        // TODO: import channel
const fetch = require("node-fetch");

const consumerGroupOptions = require('../../session/kafka/kafka-consumer-group-options');

const kafka = require('kafka-node');

let citizenKeywordLocalization = "chatbot.template.citizen";
let localisationPrefix = 'SERVICEDEFS.';
class PGRV1StatusUpdateEventFormatter{

    constructor() {
        let consumerGroup = new kafka.ConsumerGroup(consumerGroupOptions, config.pgrUseCase.pgrUpdateTopic);
        let self = this;
        consumerGroup.on('message', function(message) {
            if(message.topic === config.pgrUseCase.pgrUpdateTopic) {
                self.templateMessgae(JSON.parse(message.value))
                .then(() => {
                    console.log("template message sent to citizen");        // TODO: Logs to be removed
                })
                .catch(error => {
                    console.error('error while sending event message');
                    console.error(error.stack || error);
                });
            }
        });
    }

    async templateMessgae(serviceWrapper){
        let reformattedMessage = [];
        

        if(serviceWrapper.services[0].source == 'whatsapp'){
            let status = serviceWrapper.actionInfo[0].status;
            let action = serviceWrapper.actionInfo[0].action;
            let comments = serviceWrapper.actionInfo[0].comments;
            let citizenName = serviceWrapper.services[0].citizen.name;
            let mobileNumber = serviceWrapper.services[0].citizen.mobileNumber;

            if(!citizenName){
                let tenantId = serviceWrapper.services[0].tenantId;
                tenantId = tenantId.split(".")[0];
                let localisationCode = citizenKeywordLocalization;
                let localisationMessages = await localisationService.getMessageBundleForCode(localisationCode);
                citizenName = localisationMessages.en_IN;
            }
            let userChatNodeForStatusUpdate = this.createResponseForUser(serviceWrapper);

            if(!status && !action && comments){
                let userChatNodeForComment = userChatNodeForStatusUpdate;
                userChatNodeForComment.extraInfo = await this.createResponseForComment(serviceWrapper, comments, citizenName);
                reformattedMessage.push(userChatNodeForComment);
            }

            let extraInfo = null;

            if(status){

                if (status === "rejected") {
                    extraInfo = await this.responseForRejectedStatus(serviceWrapper, comments, citizenName);
                } 
                    
                else if ((action + "-" + status) === "reassign-assigned") {
                    extraInfo = await this.responseForReassignedStatus(serviceWrapper, citizenName, mobileNumber);
                }

                /*else if(status === "PENDINGFORREASSIGNMENT"){
                    extraInfo = await this.responseForReassignedStatus(serviceWrapper, citizenName, mobileNumber);
                }*/
                else if (status === "assigned") {
                    extraInfo = await this.responseForAssignedStatus(serviceWrapper, citizenName, mobileNumber);
                }
                    
                else if (status === "PENDINGATLME") {
                    if(action === "reassign"){
                        extraInfo = await this.responseForReassignedStatus(serviceWrapper, citizenName, mobileNumber);
                    }
                    else{
                        extraInfo = await this.responseForAssignedStatus(serviceWrapper, citizenName, mobileNumber);
                    }

                } 
                
                else if (status === "resolved") {
                    extraInfo = await this.responseForResolvedStatus(serviceWrapper, citizenName, mobileNumber);
                }
            }

            if(extraInfo){
                userChatNodeForStatusUpdate.extraInfo = extraInfo;
                reformattedMessage.push(userChatNodeForStatusUpdate);
            }

            await valueFirst.getTransformMessageForTemplate(reformattedMessage);        // TODO: Use channel.sendMessageToUser()       
        }
        
    }

    async responseForRejectedStatus(serviceWrapper, comments, citizenName){
        let rejectReason = comments.split(";");
        rejectReason = rejectReason[0];
        if(rejectReason)
            rejectReason = "Invalid Complaint";
        let serviceRequestId = serviceWrapper.services[0].serviceRequestId;
        let serviceCode = serviceWrapper.services[0].serviceCode;

        let tenantId = serviceWrapper.services[0].tenantId;
        tenantId = tenantId.split(".")[0];
        let localisationCode = localisationPrefix + serviceCode.toUpperCase();
        let localisationMessages = await localisationService.getMessageBundleForCode(localisationCode);
        let complaintCategory = localisationMessages.en_IN;
        
        let extraInfo = {};
        let params=[];

        params.push(citizenName);
        params.push(complaintCategory);
        params.push(serviceRequestId);
        params.push(rejectReason);

        extraInfo.templateId = config.valueFirstWhatsAppProvider.valuefirstNotificationRejectedTemplateid;
        extraInfo.recipient = config.whatsAppBusinessNumber;
        extraInfo.params = params;

        return extraInfo;
    }

    async responseForReassignedStatus(serviceWrapper, citizenName, mobileNumber){

        let serviceRequestId = serviceWrapper.services[0].serviceRequestId;
        let serviceCode = serviceWrapper.services[0].serviceCode;
        let assigneeName = "the concerned employee";
        if(serviceWrapper.actionInfo[0].assignee){
            let assignee = await this.getAssignee(serviceWrapper);
            assigneeName = assignee.name;
        }
        let complaintURL = await this.makeCitizenURLForComplaint(serviceRequestId, mobileNumber);

        let tenantId = serviceWrapper.services[0].tenantId;
        tenantId = tenantId.split(".")[0];
        let localisationCode = localisationPrefix + serviceCode.toUpperCase();
        let localisationMessages = await localisationService.getMessageBundleForCode(localisationCode);
        let complaintCategory = localisationMessages.en_IN;

        let extraInfo = {};
        let params=[];

        params.push(citizenName);
        params.push(complaintCategory);
        params.push(serviceRequestId);
        params.push(assigneeName);
        params.push(complaintURL);

        extraInfo.templateId = config.valueFirstWhatsAppProvider.valuefirstNotificationReassignedTemplateid;
        extraInfo.recipient = config.whatsAppBusinessNumber;
        extraInfo.params = params;

        return extraInfo;
    }

    async responseForAssignedStatus(serviceWrapper, citizenName, mobileNumber){

        let serviceRequestId = serviceWrapper.services[0].serviceRequestId;
        let serviceCode = serviceWrapper.services[0].serviceCode;
        let assigneeName = "the concerned employee";
        if( serviceWrapper.actionInfo[0].assignee){
            let assignee = await this.getAssignee(serviceWrapper);
            assigneeName = assignee.name;
        }
        let tenantId = serviceWrapper.services[0].tenantId;
        tenantId = tenantId.split(".")[0];
        let localisationCode = localisationPrefix + serviceCode.toUpperCase();
        let localisationMessages = await localisationService.getMessageBundleForCode(localisationCode);
        let complaintCategory = localisationMessages.en_IN;

        let complaintURL = await this.makeCitizenURLForComplaint(serviceRequestId, mobileNumber);
        let extraInfo = {};
        let params=[];

        params.push(citizenName);
        params.push(complaintCategory);
        params.push(serviceRequestId);
        params.push(assigneeName);
        params.push(complaintURL);

        extraInfo.templateId = config.valueFirstWhatsAppProvider.valuefirstNotificationAssignedTemplateid;
        extraInfo.recipient = config.whatsAppBusinessNumber;
        extraInfo.params = params;

        return extraInfo;
    }

    async responseForResolvedStatus(serviceWrapper, citizenName, mobileNumber){
        
        let serviceRequestId = serviceWrapper.services[0].serviceRequestId;
        let serviceCode = serviceWrapper.services[0].serviceCode;
        let complaintURL = await this.makeCitizenURLForComplaint(serviceRequestId, mobileNumber);
        let tenantId = serviceWrapper.services[0].tenantId;
        tenantId = tenantId.split(".")[0];
        let localisationCode = localisationPrefix + serviceCode.toUpperCase();
        let localisationMessages = await localisationService.getMessageBundleForCode(localisationCode);
        let complaintCategory = localisationMessages.en_IN;

        let extraInfo = {};
        let params=[];

        params.push(citizenName);
        params.push(complaintCategory);
        params.push(serviceRequestId);
        params.push(complaintURL);

        extraInfo.templateId = config.valueFirstWhatsAppProvider.valuefirstNotificationResolvedTemplateid;
        extraInfo.recipient = config.whatsAppBusinessNumber;
        extraInfo.params = params;

        return extraInfo;
    }

    createResponseForUser(serviceWrapper){

        let reformattedMessage={};

        let mobileNumber = serviceWrapper.services[0].phone;
        let uuid = serviceWrapper.services[0].addressDetail.uuid;
        let tenantId = serviceWrapper.services[0].tenantId;
        tenantId = tenantId.split(".");

        reformattedMessage.tenantId = tenantId[0];

        reformattedMessage.user = {
            mobileNumber: mobileNumber,
            userId: uuid
        };

        reformattedMessage.extraInfo = {
            recipient: config.whatsAppBusinessNumber
        };

        return reformattedMessage;
    }

    async createResponseForComment(serviceWrapper, comments, citizenName){

        let serviceRequestId = serviceWrapper.services[0].serviceRequestId;
        let serviceCode = serviceWrapper.services[0].serviceCode;
        let commentorName = "the concerned employee";
        if(serviceWrapper.actionInfo[0].assignee){
            let assignee = await this.getAssignee(serviceWrapper);
            commentorName = assignee.name;
        }

        let tenantId = serviceWrapper.services[0].tenantId;
        tenantId = tenantId.split(".")[0];
        let localisationCode = localisationPrefix + serviceCode.toUpperCase();
        let localisationMessages = await localisationService.getMessageBundleForCode(localisationCode);
        let complaintCategory = localisationMessages.en_IN;

        let extraInfo = {};
        let params=[];

        params.push(citizenName);
        params.push(commentorName);
        params.push(complaintCategory);
        params.push(serviceRequestId);
        params.push(comments);

        extraInfo.templateId = config.valueFirstWhatsAppProvider.valuefirstNotificationCommentedTemplateid
        extraInfo.recipient = config.whatsAppBusinessNumber;
        extraInfo.params = params;

        return extraInfo;
    }

    async searchUser(serviceWrapper, assigneeId){

        let url = config.egovServices.egovServicesHost + 'user/_search'

        let requestBody = {
            RequestInfo: {},
            tenantId: serviceWrapper.services[0].tenantId,
            uuid: assigneeId
          };

          let options = {
            method: 'POST',
            origin: '*',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          }

        let response = await fetch(url, options);
        if(response.status == 200){
            let responseBody = await response.json();
            return responseBody.user[0];
        }
        else{
            console.error('Error in fetching the bill');
            return undefined;
        }  

    }

    async getAssignee(serviceWrapper){
        let assigneeId = serviceWrapper.actionInfo[0].assignee;
        return await this.searchUser(serviceWrapper, assigneeId);
    }

    async getShortenedURL(finalPath){
        var url = config.egovServices.egovServicesHost + config.egovServices.urlShortnerEndpoint;
        var request = {};
        request.url = finalPath; 
        var options = {
            method: 'POST',
            body: JSON.stringify(request),
            headers: {
                'Content-Type': 'application/json'
            }
        }
        let response = await fetch(url, options);
        let data = await response.text();
        return data;
    }

    async makeCitizenURLForComplaint(serviceRequestId, mobileNumber){
        let encodedPath = urlencode(serviceRequestId, 'utf8');
        let url = config.egovServices.externalHost + "citizen/otpLogin?mobileNo=" + mobileNumber + "&redirectTo=complaint-details/" + encodedPath;
        let shortURL = await this.getShortenedURL(url);
        return shortURL;
    }

}

let pgrv1StatusUpdateEvents = new PGRV1StatusUpdateEventFormatter();

module.exports = pgrv1StatusUpdateEvents;