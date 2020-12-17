from flask import Flask, jsonify,request
import requests
from  city_extract import *
from flask_ngrok import run_with_ngrok
import json
from googletrans import Translator

translator= Translator()


city_gupshup=Flask(__name__)
run_with_ngrok(city_gupshup)

cache_cities={}
#cache_localities={}
cache_final={}
source={}


welcome= "Welcome to the *DIGIT* platform ! Please type in your city name.\n"
#welcome+="Type in your queries and I will try my best to help you !\n"

@city_gupshup.route('/',methods=['POST'])
def reply():
    request_data=request.get_json()
    inp=request_data["payload"]["payload"]["text"]

    destination=request_data["payload"]["source"]

    default = 'channel=whatsapp&source=917834811114&destination='+destination+'&message=Please%20mention%20a%20category&src.name=LocalitySearch'

    payload=default
    inp=inp.lower()
    inp_2=inp

    if (inp=="hi" or inp=="hello" or inp=="नमस्ते" or inp=="नमस्कार" or inp=="ਹਾਇ" or inp=="ਸਤ ਸ੍ਰੀ ਅਕਾਲ"):
        inp=translator.translate(inp,dest='en')
        src=inp.src
        inp=inp.text
        inp=inp.lower()
        source["src"]=src

    if (inp!="hi" and inp!="hello"):
        inp=inp_2

    url_2 = "https://api.gupshup.io/sm/api/v1/msg"
    headers = {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/x-www-form-urlencoded',
      'apikey': '443fbc250a744864c880cc6d373692cb',
      'cache-control': 'no-cache'
                      }
    if(inp=="hi" or inp=="hello" or inp=="mseva"):
        cache_cities.clear()
        cache_final.clear()
        k=payload.index("&message")
        payload=payload[0:k]+"&message="+translator.translate(welcome,dest=source["src"]).text+ "&src.name=LocalitySearch"
        #response = requests.request("POST", url, headers=headers, data = payload)

    elif (inp>="1" and inp<="9" and int(inp)>=1 and int(inp)<=9):
        if (int(inp)>len(cache_cities) or int(inp)<1):
            
            k=payload.index("&message")
            payload=payload[0:k]+"&message="+translator.translate("Please enter a valid selection",dest=source["src"]).text+translator.translate("Type 'mseva' to return back to the main menu.",dest=source["src"]).text+ "&src.name=LocalitySearch"

        else:
            """if (len(cache_localities)!=0):
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
            else:"""
            city= cache_cities[int(inp)]
            k=payload.index("&message")
            payload=payload[0:k]+"&message=*"+translator.translate((city[0].upper()+city[1:].lower()),dest=source["src"]).text+"* \n"+ translator.translate("Type 'mseva' to return back to the main menu.",dest=source["src"]).text+"&src.name=LocalitySearch"
            #cache_final["city"]=city
            cache_cities.clear()
            

    else:
        if (len(cache_cities)==0):
            m={"input_city":inp,"input_lang":"hindi"}
            response=requests.post(url="http://127.0.0.1:8080/nlp-engine/fuzzy/city", data=json.dumps(m), headers={"Content-Type": "application/json"})
            cities=json.loads(response.text)["city_detected"]
            count=1
            city_list=translator.translate("Did you mean any one of the following cities ? Enter the number of your city.",dest=source["src"]).text+'\n'
            
            for i in cities:
                cache_cities[count]=i[3:]
                city_list+=(str(count)+'.')
                city_list+=translator.translate((i[3].upper()+i[4:].lower()), dest=source["src"]).text+'\n'
                count+=1

            city_list+='\n'
            city_list+=translator.translate("Type 'mseva' to return back to the main menu.",dest=source["src"]).text

            k=payload.index("&message")
            payload=payload[0:k]+"&message="+city_list+"&src.name=LocalitySearch"

        """else:
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
            payload=payload[0:k]+"&message="+local_list+"&src.name=LocalitySearch"  """

    payload=payload.encode('utf-8')
            
    response = requests.request("POST", url_2, headers=headers, data = payload)

    return ""

city_gupshup.run()
        
            
            

        

    
    
