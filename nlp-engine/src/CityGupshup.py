from flask import Flask, jsonify,request
import requests
from  CityExtract import *
from flask_ngrok import run_with_ngrok
import json
from googletrans import Translator
from Config import *

translator= Translator()


CityGupshup=Flask(__name__)
run_with_ngrok(CityGupshup)

cacheCities={}
cacheFinal={}
source={}


welcomeMessage= WELCOME_MESSAGE


@CityGupshup.route('/',methods=['POST'])
def reply():
    requestData=request.get_json()
    inp=requestData["payload"]["payload"]["text"]

    destination=requestData["payload"]["source"]

    default = PREFIX +destination+ CATEGORY + SRC_NAME_LOCALITY

    payload=default
    inp=inp.lower()
    inp_2=inp

    if (inp in GREETINGS):
        inp=translator.translate(inp,dest='en')
        src=inp.src
        inp=inp.text
        inp=inp.lower()
        source["src"]=src

    if (inp not in GREETINGS):
        inp=inp_2

    url_2 = GUPSHUP_URL
    headers = {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/x-www-form-urlencoded',
      'apikey': '443fbc250a744864c880cc6d373692cb',
      'cache-control': 'no-cache'
                      }
    if(inp in GREETINGS):
        cacheCities.clear()
        cacheFinal.clear()
        k=payload.index(MESSAGE_TOKEN)
        payload=payload[0:k]+MESSAGE_TOKEN+translator.translate(welcomeMessage,dest=source["src"]).text+ SRC_NAME_LOCALITY
        

    elif (inp>="1" and inp<="9" and int(inp)>=1 and int(inp)<=9):
        if (int(inp)>len(cacheCities) or int(inp)<1):
            
            k=payload.index(MESSAGE_TOKEN)
            payload=payload[0:k]+MESSAGE_TOKEN+translator.translate(VALID_SELECTION,dest=source["src"]).text+translator.translate(MSEVA,dest=source["src"]).text+ SRC_NAME_LOCALITY

        else:
            
            city= cacheCities[int(inp)]
            k=payload.index(MESSAGE_TOKEN)
            payload=payload[0:k]+ MESSAGE_TOKEN +translator.translate((city[0].upper()+city[1:].lower()),dest=source["src"]).text+" \n"+ translator.translate(MSEVA,dest=source["src"]).text+ SRC_NAME_LOCALITY
            
            cacheCities.clear()
            

    else:
        if (len(cacheCities)==0):
            m={"input_city":inp,"input_lang":"hindi"}
            response=requests.post(url=CITY_LOCALHOST, data=json.dumps(m), headers={"Content-Type": "application/json"})
            cities=json.loads(response.text)["city_detected"]
            count=1
            cityList=translator.translate(CITY_LIST,dest=source["src"]).text+'\n'
            
            for i in cities:
                cacheCities[count]=i[3:]
                cityList+=(str(count)+'.')
                cityList+=translator.translate((i[3].upper()+i[4:].lower()), dest=source["src"]).text+'\n'
                count+=1

            cityList+='\n'
            cityList+=translator.translate(MSEVA,dest=source["src"]).text

            k=payload.index(MESSAGE_TOKEN)
            payload=payload[0:k]+MESSAGE_TOKEN+cityList+ SRC_NAME_LOCALITY

        

    payload=payload.encode(UTF_8)
            
    response = requests.request("POST", url_2, headers=headers, data = payload)

    return ""

CityGupshup.run()