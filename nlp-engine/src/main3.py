import nltk
from googletrans import Translator
import pickle
import string
from nltk.corpus import brown
from nltk.corpus import wordnet
from nltk.util import ngrams
from fuzzywuzzy import fuzz
import requests
import json

from auto_trial import rectify
from entity_recognition import ent_reg

punct=string.punctuation
translator= Translator()

r= requests.get('https://raw.githubusercontent.com/egovernments/egov-mdms-data/DEV/data/pb/Chatbot/KeyWords.json')
res=json.loads(r.text)



#syn=['pay','give','pay_up','ante_up','yield','bear','pay_off','make_up','compensate','devote','paid','nonrecreational','gainful','paying','given']
syn=res['KeyWords'][0]['synonyms']

#ant= ['outstanding','remaining','due','balance','pending','incomplete','exhausted','default','unpaid']
ant=res['KeyWords'][0]['antonyms']


#quits= ['quit', 'quits', 'leave', 'left', 'back', 'exit','exits','return','returns','discontinue','drop','stop','stopped']
quits=res['KeyWords'][0]['quits']


#syn_past=['past','previous','old','history','complete','completed','done','preceding','former','late','chronicle','ended','completed','accomplished','realized','receipt','receipts']
syn_past=res['KeyWords'][0]['syn_past']


#not_paid=['not paid', 'not complete', 'not done', 'not given','not past','not old','not completed','not ended','not accomplished','not realized']
not_paid=res['KeyWords'][0]['bigrams'][0]['values']
for i in range(len(not_paid)):
    not_paid[i]=res['KeyWords'][0]['bigrams'][0]['prefix']+' '+not_paid[i]


#not_due=['not due', 'not remaining', 'not pending', 'not outstanding', 'not balance','not incomplete','not default','not unpaid']
not_due=res['KeyWords'][0]['bigrams'][1]['values']
for i in range(len(not_due)):
    not_due[i]=res['KeyWords'][0]['bigrams'][1]['prefix']+' '+not_due[i]


to_be_paid=['to be paid', 'to be paid','not paid yet','not yet paid']

#not_to_be_paid= ['not to be paid', 'not to be given']
not_to_be_paid=res['KeyWords'][0]['bigrams'][2]['values']
for i in range(len(not_to_be_paid)):
    not_to_be_paid[i]=res['KeyWords'][0]['bigrams'][2]['prefix']+' '+not_to_be_paid[i]


def features(sentence):
    
    
    count_not=0
    paid=0
    unpaid=0
   
    for word in sentence:
        if word in syn:
            paid+=1
        if word in ant:
            unpaid+=1
        
    
    text=nltk.word_tokenize(sentence)
    result=nltk.pos_tag(text)
    a=list()
    for j in result:
        a.append(j[1])
    res={}
    res['count_vbd']=a.count("VBD")
    res['count_vbn']=a.count("VBN")
    res['count_vbg']=a.count("VBG")
    res['count_vbp']=a.count("VBP")
    res['count_vbz']=a.count("VBZ")
    res['count_md']=a.count("MD")
    res['paid']=paid
    res['unpaid']=unpaid
    
    
    return res

classifier_f = open("dectree.pickle", "rb")
classifier = pickle.load(classifier_f)
classifier_f.close()


print ('done')

def process(a):
    a=a.replace("n't",' not')
    a=a.replace("'d"," would")
    new_sent=""
    for i in a:
        if i not in punct:
            new_sent=new_sent+i
    new_sent=new_sent.lower()
    a=new_sent
    (a,flag)=rectify(a)
    
    #(a,flag)=rectify(a)
    
    if a=="invalid":
        return "Sorry, I did not understand that. Please try again."

    if a=="hello":
        welcome= "Welcome to the *DIGIT* platform ! Now you can pay your bills and retrieve paid receipts for property, water and sewerage and trade licenses.\n"
        welcome+="Type in your queries and I will try my best to help you !\n"
        welcome+="At any stage, type *quit* if you want to exit."
        return welcome
        
    #new_sent=""
    #for i in a:
    #    if i not in punct:
    #        new_sent=new_sent+i
    #new_sent=new_sent.lower()
    #a=new_sent
    #a=rectify(a)
   
    
    
    b=translator.translate(a,dest='en').text
    for i in b.split():
        for j in quits:
            if fuzz.ratio(i,j)>=75:
                return "Exiting..."

    
    

    grams_2=ngrams(nltk.word_tokenize(a),2)
    grams_3=ngrams(nltk.word_tokenize(a),3)
    grams_4=ngrams(nltk.word_tokenize(a),4)
    count_4=0
    count_3=0
    count_2=0
    count_nd=0

    for i in grams_4:
        if ' '.join(list(i)) in not_to_be_paid:
            count_4 +=1
    for i in grams_3:
        if ' '.join(list(i)) in to_be_paid:
            count_3 +=1
    for i in grams_2:
        if ' '.join(list(i)) in not_paid:
            count_2 +=1
        elif ' '.join(list(i)) in not_due:
            count_nd+=1

    if count_4 + count_2 + count_3+count_nd >=1:
        if count_4>0:
            if(ent_reg(a)[0]==''):
                
                return "Please mention a category for bill payment/receipts."
                
                
                
            return "Showing your "+ent_reg(a)[0]+ " receipts "+ ent_reg(a)[1]
            
        elif count_3>0:
            if(ent_reg(a)[0]==''):
                
                return "Please mention a category for bill payment/receipts."
                
            if flag==1:
                return 'You may visit '+ent_reg(a)[2]+' for paying your '+ent_reg(a)[0]+ " bills "
            else:
                return 'Visit '+ent_reg(a)[2]+' for paying your '+ent_reg(a)[0]+ " bills "
            
        else:
            if(ent_reg(a)[0]==''):
                
                return "Please mention a category for bill payment/receipts."
                
            
            if count_nd>0:
                return "Showing your "+ent_reg(a)[0]+  " receipts "+ ent_reg(a)[1]
                
            else:
                if flag==1:
                    return 'You may visit '+ent_reg(a)[2]+' for paying your '+ent_reg(a)[0]+ " bills "
                else:
                    return 'Visit '+ent_reg(a)[2]+' for paying your '+ent_reg(a)[0]+ " bills "

    else:
            
    
        count1=0
        for word in a.split():
            if word in syn_past:
                count1=count1+1
        if count1>0:
            if(ent_reg(a)[0]==''):
                
                return "Please mention a category for bill payment/receipts."
                
            
            return "Showing your "+ent_reg(a)[0]+  " receipts "+ ent_reg(a)[1]
            
        else:
            ans=classifier.classify(features(a))
            if(ent_reg(a)[0]==''):
                
                return "Please mention a category for bill payment/receipts."
                   
            
            if ans=='paid':
            
                return "Showing your "+ent_reg(a)[0]+  " receipts "+ ent_reg(a)[1]
                
            elif ans=='unpaid':
                if flag==1:
                    return 'You may visit '+ent_reg(a)[2]+' for paying your '+ent_reg(a)[0]+ " bills "
                else:
                    return 'Visit '+ent_reg(a)[2]+' for paying your '+ent_reg(a)[0]+ " bills "

#while True:
#    inp=input('USER:\n')
#    print ('BOT: '+process(inp))
    
