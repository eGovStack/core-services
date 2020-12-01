import string
import nltk
from fuzzywuzzy import fuzz
from googletrans import Translator
from nltk.util import ngrams
import requests
import json

translator= Translator()

punct= string.punctuation

r= requests.get('https://raw.githubusercontent.com/egovernments/egov-mdms-data/DEV/data/pb/Chatbot/CityNames.json')
r2= requests.get('https://raw.githubusercontent.com/egovernments/egov-mdms-data/DEV/data/pb/Chatbot/CityLocaleMasterData.json')
res= json.loads(r.text)
res2= json.loads(r2.text)

cities=res["CityNames"][0]["cities"]
cities_hin=res["CityNames"][1]["cities"]
city_punjabi=res["CityNames"][2]["cities"]

master= res2["CityLocaleMasterData"]

for i in range(0,len(cities)):
    cities[i]= cities[i].lower()


cities=cities+cities_hin+city_punjabi

def find_city(a):
    a= [i for i in a if i not in punct]
    a= ''.join(a)
    a=a.lower()

    max1=0
    city=[[0,"Please try again"]]
    #result=list()
    
    for j in master:

        if (a == j["cityName"].lower()[0:len(a)]):
            city.append([100,j["tenantId"]])
            
        elif fuzz.ratio(a,j["cityName"].lower())>=50 :
            max1=max(max1,fuzz.ratio(a,j["cityName"].lower()))
            city.append([fuzz.ratio(a,j["cityName"].lower()),j["tenantId"]])
            #result.append(j["CityName"].lower())
                
                
    exact_match='false'
    if max1==100:
        exact_match='true'
    k= sorted(city)
   

    
    final_answer=list()
    for i in range(min(5,len(k))):
        final_answer.append(k[len(k)-1-i][1])
    
    return (final_answer,max1,exact_match)
    #return (k,max1,exact_match)
