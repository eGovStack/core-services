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
res= json.loads(r.text)


cities=res["CityNames"][0]["cities"]
cities_hin=res["CityNames"][1]["cities"]
city_punjabi=res["CityNames"][2]["cities"]

for i in range(0,len(cities)):
    cities[i]= cities[i].lower()


cities=cities+cities_hin+city_punjabi

def find_city(a):
    a= [i for i in a if i not in punct]
    a= ''.join(a)
    a=a.lower()

    max1=0
    city=[[0,"Please try again"]]
    

    grams_2=ngrams(nltk.word_tokenize(a),2)
    grams_3=ngrams(nltk.word_tokenize(a),3)

    for i in grams_3:
        i= list(i)
        for j in cities:
            if fuzz.ratio(' '.join(i),j)>=50:
                
                
                city.append([fuzz.ratio(' '.join(i),j),j])
                

    for i in grams_2:
        i= list(i)
        for j in cities:
            if fuzz.ratio(' '.join(i),j)>=50:
                
               
                city.append([fuzz.ratio(' '.join(i),j),j])
                
    
    
    for i in a.split():
        for j in cities:
            
            if fuzz.ratio(i,j)>=50:
                
                city.append([fuzz.ratio(i,j),j])
                
                
    exact_match='false'
    if max1==100:
        exact_match='true'
    k= sorted(city)
   

    
    final_answer=list()
    for i in range(min(3,len(k))):
        final_answer.append(k[len(k)-1-i][1])
    
    return (final_answer,max1,exact_match)
