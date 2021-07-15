const {CERTIFICATE_CONTROLLER_ID,
  CERTIFICATE_DID,
  CERTIFICATE_NAMESPACE,
  CERTIFICATE_ISSUER,
  CERTIFICATE_BASE_URL,
  CERTIFICATE_FEEDBACK_BASE_URL,
  CERTIFICATE_INFO_BASE_URL,
  CERTIFICATE_PUBKEY_ID
} = require ("./config/config");
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const jsigs = require('jsonld-signatures');
const config = require('./config/config');
const {publicKeyPem, privateKeyPem} = require('./config/keys');
const R = require('ramda');
const {RsaSignature2018} = jsigs.suites;
const {AssertionProofPurpose} = jsigs.purposes;
const {RSAKeyPair} = require('crypto-ld');
const {documentLoaders} = require('jsonld');
const {node: documentLoader} = documentLoaders;
const {contexts} = require('security-context');
const credentialsv1 = require('./credentials.json');
const {vaccinationContext} = require("vaccination-context");
const tlCertificate = require('./TLCertificateSchema.json');


const UNSUCCESSFUL = "UNSUCCESSFUL";
const SUCCESSFUL = "SUCCESSFUL";
const DUPLICATE_MSG = "duplicate key value violates unique constraint";

const publicKey = {
  '@context': jsigs.SECURITY_CONTEXT_URL,
  id: CERTIFICATE_DID,
  type: 'RsaVerificationKey2018',
  controller: CERTIFICATE_PUBKEY_ID,
  publicKeyPem
};
const documentLoaderMapping = {"https://w3id.org/security/v1" : contexts.get("https://w3id.org/security/v1")};
documentLoaderMapping[CERTIFICATE_DID] = publicKey;
documentLoaderMapping[CERTIFICATE_PUBKEY_ID] = publicKey;
documentLoaderMapping['https://www.w3.org/2018/credentials#'] = credentialsv1;
documentLoaderMapping["https://www.w3.org/2018/credentials/v1"] = credentialsv1;
documentLoaderMapping[CERTIFICATE_NAMESPACE] = vaccinationContext;
documentLoaderMapping["https://dev.digit.org/tradelicense"] = tlCertificate;

const customLoader = url => {
  console.log("checking " + url);
  let context = documentLoaderMapping[url];
  if (context === undefined) {
    context = contexts[url];
  }
  if (context !== undefined) {
    return {
      contextUrl: null,
      documentUrl: url,
      document: context
    };
  }
  if (url.startsWith("{")) {
    return JSON.parse(url);
  }
  console.log("Fallback url lookup for document :" + url);
  return documentLoader()(url);
};


async function signJSON(certificate) {
  const publicKey = {
    '@context': jsigs.SECURITY_CONTEXT_URL,
    id: CERTIFICATE_DID,
    type: 'RsaVerificationKey2018',
    controller: CERTIFICATE_CONTROLLER_ID,
    publicKeyPem
  };
  const controller = {
    '@context': jsigs.SECURITY_CONTEXT_URL,
    id: CERTIFICATE_CONTROLLER_ID,
    publicKey: [publicKey],
    // this authorizes this key to be used for making assertions
    assertionMethod: [publicKey.id]
  };
  console.log("XXXXXX", certificate);
  const key = new RSAKeyPair({...publicKey, privateKeyPem});

  const signed = await jsigs.sign(certificate, {
    documentLoader: customLoader,
    suite: new RsaSignature2018({key}),
    purpose: new AssertionProofPurpose({
      controller: controller
    }),
    compactProof: false
  });
  /*certificateWrapper = { "RequestInfo" : requestInfo,
                              "Licenses" : tradeLicensePayload
                            };*/
  //certificateWrapper.Licenses[0].signedCertificate = JSON.stringify(signed);
  //console.log(certificateWrapper);
  /*try{
    fetch('http://localhost:8080/pdf-service/v1/_createnosave?key=tlcertificate&tenantId=pb', {
                      method: 'POST',
                      body: JSON.stringify(certificateWrapper),
                      headers: { 'Content-Type': 'application/json' }})
                      .then(res => res.json())
                      .then(json => console.log(json));
  } catch (err) {
    console.log(err);
  }*/
  return signed;
}

function transformW3(cert) {
  //console.log(cert);
  const certificateFromTemplate = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://dev.digit.org/tradelicense"
      ],
    type: ['VerifiableCredential', 'TradeLicenseCredential'],
    credentialSubject: {
                  /*"tlno" : {"f1" : R.pathOr("", ["tlno"], cert),},
                  "appno" : R.pathOr("", ["appno"], cert),
                  "receiptno" : R.pathOr("", ["receiptno"], cert),
                  "finyear" : R.pathOr("", ["finyear"], cert),
                  "tradename" : R.pathOr("", ["tradename"], cert),
                  "ownername" : R.pathOr("", ["ownername"], cert),
                  "ownercontact" : R.pathOr("", ["ownercontact"], cert),
                  "tradeaddress" : R.pathOr("", ["tradeaddress"], cert),
                  "tradetype" : R.pathOr("", ["tradetype"], cert),
                  "accessories" : R.pathOr("", ["accessories"], cert),
                  "issuedate" : R.pathOr("", ["issuedate"], cert),
                  "validity" : R.pathOr("", ["validity"], cert)
                  */
                  "licenseNumber": R.pathOr("", ["licenseNumber"], cert.Licenses[0]),
                  "applicationNumber": R.pathOr("", ["applicationNumber"], cert.Licenses[0]),
                  "financialYear": R.pathOr("", ["financialYear"], cert.Licenses[0]),
                  "tradeName": R.pathOr("", ["tradeName"], cert.Licenses[0]),
                  "ownerName": R.pathOr("", ["name"], cert.Licenses[0].tradeLicenseDetail.owners[0]),
                  "ownerContact": R.pathOr("", ["mobileNumber"], cert.Licenses[0].tradeLicenseDetail.owners[0]),
                  "tradeAddress": {"tradeAddressLocality" : R.pathOr("", ["name"], cert.Licenses[0].tradeLicenseDetail.address.locality),
                                   "tradeAddressCity" : R.pathOr("", ["city"], cert.Licenses[0].tradeLicenseDetail.address)},
                  "tradeType": R.pathOr("", ["tradeType"], cert.Licenses[0].tradeLicenseDetail.tradeUnits[0]),
                  "TradeTypeMessage": R.pathOr("", ["TradeTypeMessage"], cert.Licenses[0]),
                  //"accessories": R.pathOr("", ["accessoryCategory"], cert.Licenses[0].tradeLicenseDetail.accessories[0]),
                  "issuedDate": R.pathOr("", ["issuedDate"], cert.Licenses[0]),
                  "validFrom": R.pathOr("", ["validFrom"], cert.Licenses[0]),
                  "validTo": R.pathOr("", ["validTo"], cert.Licenses[0]),
    },
    issuer: "https://dev.digit.org/",
    issuanceDate: new Date().toISOString(),
    evidence: [{
        "id": "https://dev.digit.org/TL/" + R.pathOr("", ["applicationNumber"], cert.Licenses[0]),
        "type": ["Trade license certificate"]
    }]
  };
  return certificateFromTemplate;
}

async function signAndSave(certificate, retryCount = 0) {
  //tradeLicensePayload = certificate.Licenses;
  //requestInfo = certificate.RequestInfo;
  const certificateWrapper = certificate;
  const w3cCertificate = transformW3(certificate);
  const signedCert = await signJSON(w3cCertificate);
  console.log("######", signedCert);
  certificateWrapper.Licenses[0].signedCertificate = JSON.stringify(signedCert);
  //console.log("######", signedCert);
  return certificateWrapper;
}

// MIDDLE WARE
app.use(express.json());
app.use(express.urlencoded());

// ENDPOINTS
/*
app.post('/sign-tl-data', (req, res) => {
  let jsonMessage = req.body;
      try {
        //console.log("Message received: " + jsonMessage);
        async function myFunc(str){
          res.send(await signAndSave(str));
        }
        myFunc(jsonMessage);
      } catch (e) {
        console.error("ERROR: " + e.message);
      }
  });

const port = process.env.PORT || 8082;
app.listen(port, () => console.log(`Listening on port ${port}..`));
*/
module.exports = {
  signAndSave,
  signJSON,
  transformW3,
  customLoader
};
