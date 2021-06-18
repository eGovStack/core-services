import request from "request";
import fs from "fs";
import get from "lodash/get";
import axios, { post } from "axios";
import envVariables from "../EnvironmentVariables";

let egovFileHost = envVariables.EGOV_FILESTORE_SERVICE_HOST;

/**
 *
 * @param {*} filename -name of localy stored temporary file
 * @param {*} tenantId - tenantID
 */
export const certificateSignerAPICall = async function(tradeLicensePayload) {
  var url = 'http://localhost:8082/sign-tl-data';
  //console.log(tradeLicensePayload);
  let response = await axios.post(url, tradeLicensePayload);
  //console.log("XXXXX", response.data);
  return response.data;
};