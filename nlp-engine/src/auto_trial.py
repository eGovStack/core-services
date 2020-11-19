import nltk
import string
from nltk.corpus import brown
from nltk.corpus import wordnet
from nltk.util import ngrams
from fuzzywuzzy import fuzz
import requests
import json

#stopwords=open('stopwords.txt').readlines()
r_stop=requests.get('https://raw.githubusercontent.com/egovernments/egov-mdms-data/DEV/data/pb/Chatbot/stopwords.txt')
stopwords=r_stop.text.splitlines()

#for i in range(0,len(stopwords)):
#    stopwords[i]= stopwords[i][0:len(stopwords[i])-1].lower()

rem=stopwords
#rem= rem+['show','see']
keep=['are','to','be','not']
from autocorrect import Speller
spell=Speller(lang='en')

r= requests.get('https://raw.githubusercontent.com/egovernments/egov-mdms-data/DEV/data/pb/Chatbot/KeyWords.json')
res=json.loads(r.text)


#syn=['pay','give','pay_up','ante_up','yield','bear','pay_off','make_up','compensate','devote','paid','nonrecreational','gainful','paying','given']
#ant= ['outstanding','remaining','due','balance','pending','incomplete','exhausted','default','unpaid']
#quits= ['quit', 'quits', 'leave', 'left', 'back', 'exit','exits','return','returns','discontinue','cease','drop','stop','stopped']
#syn_past=['past','previous','old','history','complete','completed','done','preceding','former','late','chronicle','ended','completed','accomplished','realized','receipt','receipts']
#not_paid=['not paid', 'not complete', 'not done', 'not given','not past','not old','not completed','not ended','not accomplished','not realized']
#not_due=['not due', 'not remaining', 'not pending', 'not outstanding', 'not balance','not incomplete','not default','not unpaid']
#not_to_be_paid= ['not to be paid', 'not to be given']

to_be_paid=['to be paid', 'to be paid','not paid yet','not yet paid']

syn=res['KeyWords'][0]['synonyms']

ant=res['KeyWords'][0]['antonyms']

quits=res['KeyWords'][0]['quits']

syn_past=res['KeyWords'][0]['syn_past']

not_paid=res['KeyWords'][0]['bigrams'][0]['values']
for i in range(len(not_paid)):
    not_paid[i]=res['KeyWords'][0]['bigrams'][0]['prefix']+' '+not_paid[i]

not_due=res['KeyWords'][0]['bigrams'][1]['values']
for i in range(len(not_due)):
    not_due[i]=res['KeyWords'][0]['bigrams'][1]['prefix']+' '+not_due[i]

not_to_be_paid=res['KeyWords'][0]['bigrams'][2]['values']
for i in range(len(not_to_be_paid)):
    not_to_be_paid[i]=res['KeyWords'][0]['bigrams'][2]['prefix']+' '+not_to_be_paid[i]




my_list=syn+ant+syn_past+quits+ ['to','be','hi','hello','water', 'sewerage', 'electricity', 'property','income','trade license','show','see','bills']
my_list=list(set(my_list))

def rectify(s):
    s=s.lower()
    if s=="hi" or s=="hello":
        return ("hello",0)
    
    s=s.replace('to see', 'show')
    s=s.replace('see','show')
    s=s.replace('to retrieve','show')
    s=s.replace('to retrieved','show')
    s=s.replace('to get', 'show')
    s=s.replace('get','')
    s=s.replace('take','')
    s=s.replace('look','')
    
    
    s_new=""
    for i in s:
        if len(s_new)<2:
            s_new=s_new+i
        elif (s_new[len(s_new)-1]!=i or s_new[len(s_new)-2]!=i):
            s_new=s_new+i

    s_new=s_new.replace("n't",' not')
    s_new=s_new.replace("'d"," would")
    
    

    for i in s_new.split():
        if i in rem and i not in keep:
            s_new=s_new.replace(i,'')

    #return spell(s_new)
    s_new= s_new.replace('wetar', 'water')
    s_new=s_new.replace (' want ', ' ')
    s_new=s_new.replace(' wants ', ' ')
    s_new=s_new.replace (' wanted ', ' ')
    
    
    
    
    s_new2=''
    count=0
    for i in s_new.split():
        max1=0
        
        new_word=''
        for j in my_list:
            if fuzz.ratio(i,j)>=70 and fuzz.ratio(i,j)>max1:
                count+=1
                max1=fuzz.ratio(i,j)
                new_word=j
                
        if max1!=0:
            s_new2+=new_word+' '
        else:
            s_new2+= spell(i)+' '

    #new lines
    flag=0
    if 'show' in s_new2 or 'see' in s_new2:
        flag=1
    word_list=s_new2.split();
    s_new3=' '.join([i for i in word_list if i not in ['see','show']])
    #newlines end

    if count!=0:
        #return s_new2[0:len(s_new2)-1]
        return (s_new3,flag)
    else:
        return ("invalid",flag)

#while True:
#    a=input("type something\n")
#    print (rectify(a)+'\n')
        



