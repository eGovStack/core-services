from IntentRecognition import *
from flask import Flask, jsonify, request, send_file
from EntityRecognition import *
import requests
from googletrans import Translator
from fuzzywuzzy import fuzz
from Config import *

from CityExtract import find_city
import time

import speech_recognition as sr
from os import path
from pydub import AudioSegment

translator= Translator()
#languages={
#    'english':'en',
#    'hindi':'hi',
#    'marathi': 'mr', 'gujarati':'gu', 'punjabi':'pa',  'kannada':'kn', 'tamil':'ta', 'malayalam': 'ml', 'telugu':'te', 'bengali': 'bn', 'bangla': 'bn'
#    }

languages = LANGUAGE_CODES

# LANGUAGE FUZZY MATCHING
def close_to(entry):
    entry=entry.lower()
    for i in languages.keys():
        if fuzz.ratio(i,entry)>=75:
            return i
    return 'english'

ChatbotApi = Flask(__name__)

@ChatbotApi.route('/', methods=['POST'])
def reply():
    requestData=request.get_json()
    inp=""
    
    # IF INPUT IS A VOICE MESSAGE
    if requestData["payload"]["type"]=="audio" :
        audioUrl=requestData["payload"]["payload"]["url"]
        getAudioFile=requests.get(audioUrl, allow_redirects=True)
        open('voice_message.ogg', 'wb').write(getAudioFile.content)
        sound=AudioSegment.from_ogg("voice_message.ogg")
        
        sound.export("voice_message.wav", format="wav")

        AUDIO_FILE = "voice_message.wav"
        r = sr.Recognizer()
        with sr.AudioFile(AUDIO_FILE) as source:
            audio = r.record(source)
            inp=r.recognize_google(audio)
    else:
        inp=requestData["payload"]["payload"]["text"]

    destination=requestData["payload"]["source"]

    default = PREFIX+destination + CATEGORY +SRC_NAME

    payload= default
    
    
    inp=inp.lower()
    

    url = GUPSHUP_URL
    headers = {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/x-www-form-urlencoded',
      'apikey': '37cef3c8bf164df7cdc0a36eae94beec',
      'cache-control': 'no-cache'
                      }
                      
                      
    # INPUT IS TAKEN AS CITY NAME
    if len(inp.split())==1 and inp not in GREETINGS:
        answer=find_city(inp)[0].upper()
        answer=answer[0]+answer[1:].lower()

        k=payload.index(MESSAGE_TOKEN)
        payload=payload[0:k]+MESSAGE_TOKEN+translator.translate(CITY_PART_1 +answer+ CITY_PART_2,dest='en').text+ SRC_NAME
        response = requests.request("POST", url, headers=headers, data = payload)

        payload=payload[0:k]+MESSAGE_TOKEN+translator.translate(CITY_CONFIRMATION,dest='en').text+ SRC_NAME
        response = requests.request("POST", url, headers=headers, data = payload)
        return ""
        

    inp=translator.translate(inp,dest='en')
    sourceLanguage=inp.src
    inp=inp.text
    result= process(inp)
    
    resultArray=result.split()
    
    
    # IF OUTPUT IS A WELCOME MESSAGE
    if resultArray[0]==WELCOME_RESULT :
        
        k=payload.index(MESSAGE_TOKEN)
        payload=payload[0:k]+MESSAGE_TOKEN+translator.translate(result,dest=sourceLanguage).text+ SRC_NAME
        response = requests.request("POST", url, headers=headers, data = payload)
        
        
        k=payload.index(MESSAGE_TOKEN)
        payload=payload[0:k]+MESSAGE_TOKEN+translator.translate(ASK_CITY_NAME,dest=sourceLanguage).text+ SRC_NAME
        

        
            
        
    #OUTPUT IS A RECEIPT    
    elif resultArray[0]==RECEIPT_TOKEN:
        if WATER in resultArray:
            payload = PREFIX+destination+ WATER_RECEIPTS+ SRC_NAME

        elif TRADE in resultArray:
            payload = PREFIX+destination+ TRADE_RECEIPTS + SRC_NAME

        elif PROPERTY in resultArray:
            payload = PREFIX+destination+ PROPERTY_RECEIPTS + SRC_NAME

        else:
        
            #Send out a message that entity is not mentioned properly.
            
            k=payload.index(MESSAGE_TOKEN)
            payload=payload[0:k]+MESSAGE_TOKEN+translator.translate(result,dest=sourceLanguage).text+ SRC_NAME 
            
    #OUTPUT IS A BILL
    elif resultArray[0]==BILL_TOKEN:
        
        
        
        k=payload.index(MESSAGE_TOKEN)
        payload=payload[0:k]+MESSAGE_TOKEN+translator.translate(result,dest=sourceLanguage).text+ SRC_NAME

    elif resultArray[0]==BILL_TOKEN_NEW:

        if WATER in resultArray:
            payload = PREFIX +destination + WATER_BILL + SRC_NAME

        elif TRADE in resultArray:
            payload = PREFIX +destination+ TRADE_BILL + SRC_NAME

        elif PROPERTY in resultArray:
            payload = PREFIX +destination+ PROPERTY_BILL + SRC_NAME

        

        response = requests.request("POST", url, headers=headers, data = payload)

        k=payload.index(MESSAGE_TOKEN)
        payload=payload[0:k]+MESSAGE_TOKEN+translator.translate(result,dest=sourceLanguage).text+ SRC_NAME

        

        
   

   
        
    else:
        
        
        k=payload.index(MESSAGE_TOKEN)
        payload=payload[0:k]+MESSAGE_TOKEN+translator.translate(result,dest=sourceLanguage).text+ SRC_NAME
    
         
    
    if resultArray[0]!= RECEIPT_TOKEN:
        payload=payload.encode(UTF_8)

        
     
    response = requests.request("POST", url, headers=headers, data = payload)

    return ""



ChatbotApi.run()
    
