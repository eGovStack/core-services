from flask import Flask, jsonify, request
import requests
from city_extract import *
from flask_ngrok import run_with_ngrok
import json
import speech_recognition as sr
from pydub import AudioSegment

city_audio=Flask(__name__)
run_with_ngrok(city_audio)

cache_cities={}
cache_final={}
cache_localities={}
source={}

welcome= "Welcome to the *DIGIT* platform ! Please type in your city name.\n"

@city_audio.route('/',methods=['POST'])
def reply():
    destination="919619367055"
    payload='channel=whatsapp&source=917834811114&destination=919619367055&message=Please%20mention%20a%20category&src.name=LocalitySearch'
    url_2 = "https://api.gupshup.io/sm/api/v1/msg"
    headers = {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/x-www-form-urlencoded',
      'apikey': '443fbc250a744864c880cc6d373692cb',
      'cache-control': 'no-cache'
                      }
    
    request_data=request.get_json()
    inp=""
    
    if request_data["payload"]["type"]=="audio" :
        audio_url=request_data["payload"]["payload"]["url"]
        r=requests.get(audio_url, allow_redirects=True)
        open('voice_message.ogg', 'wb').write(r.content)
        sound=AudioSegment.from_ogg("voice_message.ogg")
        
        sound.export("voice_message.wav", format="wav")

        AUDIO_FILE = "voice_message.wav"
        r = sr.Recognizer()
        with sr.AudioFile(AUDIO_FILE) as source:
            audio = r.record(source)
            inp=r.recognize_google(audio)
    else:
        inp=request_data["payload"]["payload"]["text"]

    

    inp=inp.lower()
    

    

    if(inp=="hi" or inp=="hello" or inp=="mseva"):
        cache_cities.clear()
        cache_final.clear()
        #new
        cache_localities.clear()
        k=payload.index("&message")
        payload=payload[0:k]+"&message="+welcome+ "&src.name=LocalitySearch"
        

    elif (inp>="1" and inp<="9" and int(inp)>=1 and int(inp)<=9):
        
        if (int(inp)>len(cache_cities) or int(inp)<1):
            k=payload.index("&message")
            payload=payload[0:k]+"&message="+"Please enter a valid selection\n"+"Type 'mseva' to return back to the main menu."+ "&src.name=LocalitySearch"

        else:
            
            #new_start
            if (len(cache_localities)!=0):
                
                #city=cache_final['city']
                locality=cache_localities[int(inp)]
                #m={"city":city, "locality":locality}
                k=payload.index("&message")
                payload=payload[0:k]+"&message="+"Locality detected--> "+locality.upper()+ "&src.name=LocalitySearch"
                cache_cities.clear()
                cache_final.clear()
                cache_localities.clear()
                
                #response=requests.post(url="http://0.0.0.0:8080/nlp-engine/fuzzy/locality", data=json.dumps(m), headers={"Content-Type": "application/json"})
                #predictions= possibles=json.loads(response.text)["predictions"]
            #new_end
            else:
                city= cache_cities[int(inp)]
                k=payload.index("&message")
                payload=payload[0:k]+"&message=*"+(city[0].upper()+city[1:].lower())+"* \n"+ "Type the name of your locality\n"+"Type 'mseva' to return back to the main menu."+"&src.name=LocalitySearch"
                cache_final["city"]=city
                #cache_cities.clear()
            

    else:
        if (len(cache_cities)==0):
            m={"input_city":inp,"input_lang":"hindi"}
            response=requests.post(url="http://127.0.0.1:8080/nlp-engine/fuzzy/city", data=json.dumps(m), headers={"Content-Type": "application/json"})
            cities=json.loads(response.text)["city_detected"]
            count=1
            city_list="Did you mean any one of the following cities ? Enter the number of your city."+'\n'
            
            for i in cities:
                cache_cities[count]=i[3:]
                city_list+=(str(count)+'.')
                city_list+=(i[3].upper()+i[4:].lower())+'\n'
                count+=1

            city_list+='\n'
            city_list+="Type 'mseva' to return back to the main menu."

            k=payload.index("&message")
            payload=payload[0:k]+"&message="+city_list+"&src.name=LocalitySearch"
            
        #new_start
        else:
            m={"city":cache_final["city"],"locality":inp}
            response=requests.post(url="http://127.0.0.1:8080/nlp-engine/fuzzy/locality", data=json.dumps(m), headers={"Content-Type": "application/json"})
            localities=json.loads(response.text)["predictions"]
            count=1
            local_list="Did you mean any one of the following localities ? Enter the number of your locality.\n"

            for i in localities:
                cache_localities[count]=i["name"]
                local_list+=(str(count)+'.'+i["code"]+' . '+i["name"]+'\n')
                count+=1

            k=payload.index("&message")
            payload=payload[0:k]+"&message="+local_list+"&src.name=LocalitySearch"  
        #new_end
       

    payload=payload.encode('utf-8')
            
    response = requests.request("POST", url_2, headers=headers, data = payload)

    return ""

city_audio.run()
