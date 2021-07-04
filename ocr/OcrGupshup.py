from flask import Flask, jsonify, request
import requests
from flask_ngrok import run_with_ngrok
from SkewTest import *
import json

OcrGupshup= Flask(__name__)
run_with_ngrok(OcrGupshup)

@OcrGupshup.route('/', methods=['POST'])
def reply():
    requestData=request.get_json()

    welcomeMessage= "Welcome to the *DIGIT* platform! You can now scan your documents online and get them verified.\nGo ahead and upload an image of your document!"

    destination=requestData["payload"]["source"]

    default = 'channel=whatsapp&source=917834811114&destination='+destination+'&message=Please%20mention%20a%20category&src.name=LocalitySearch'

    payload=default

    url_2 = "https://api.gupshup.io/sm/api/v1/msg"
    headers = {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/x-www-form-urlencoded',
      'apikey': '443fbc250a744864c880cc6d373692cb',
      'cache-control': 'no-cache'
      }

    if requestData["payload"]["type"]=="image":
        imageUrl= requestData["payload"]["payload"]["url"]
        imageFile=requests.get(imageUrl, allow_redirects=True)
        open('gupshup_test.jpg', 'wb').write(imageFile.content)
        k=payload.index("&message")
        payload=payload[0:k]+"&message="+ocr("gupshup_test.jpg")+ "&src.name=LocalitySearch"
        response = requests.request("POST", url_2, headers=headers, data = payload)
        k=payload.index("&message")
        payload=payload[0:k]+"&message="+"Type 'mseva' to go back to the main menu"+ "&src.name=LocalitySearch"
        response = requests.request("POST", url_2, headers=headers, data = payload)

    else:
        k=payload.index("&message")
        payload=payload[0:k]+"&message="+welcomeMessage+ "&src.name=LocalitySearch"
        response = requests.request("POST", url_2, headers=headers, data = payload)
        


    

    return ""

OcrGupshup.run()
        
        
