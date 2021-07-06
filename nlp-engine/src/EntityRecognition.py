import nltk
from fuzzywuzzy import fuzz
from nltk.util import ngrams
from Config import *


def ent_reg(sent):
    sent=sent.lower()
    taxes=TAX_ENTITIES

    bigrams=ngrams(nltk.word_tokenize(sent),2)
    
    entity=''
    maxRatio=0
    for i in bigrams:
        guess=' '.join(list(i))
        if fuzz.ratio(guess,TRADE_LICENSE)>=60:
            entity=TRADE_LICENSE

    
    record= dict()
    for k in taxes:
        record[k]=0
    
    
    for i in sent.split():
        for j in taxes:
            if fuzz.ratio(i,j)>=60 and fuzz.ratio(i,j)>maxRatio:
                maxRatio=fuzz.ratio(i,j)
                entity=j
            
            
    result = list()
    result.append(entity)
    
    if entity==WATER or entity==SEWERAGE:
        result.append(WATER_LINK_PAID)
        result.append(WATER_LINK_UNPAID)
        
    elif entity==PROPERTY:
        result.append(PROPERTY_LINK_PAID)
        result.append(PROPERTY_LINK_UNPAID)
        
    elif entity==TRADE_LICENSE:
        result.append(TRADE_LINK_PAID)
        result.append(TRADE_LINK_UNPAID)
        
    else:
        result.append("no link")
        result.append("no link")
    
    return result