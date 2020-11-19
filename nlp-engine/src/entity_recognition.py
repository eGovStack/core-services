import nltk
from fuzzywuzzy import fuzz
from nltk.util import ngrams



def ent_reg(sent):
    sent=sent.lower()
    taxes=['water', 'sewerage', 'electricity', 'property','income','trade license']

    grams_2=ngrams(nltk.word_tokenize(sent),2)
    
    s=''
    max1=0
    for i in grams_2:
        s1=' '.join(list(i))
        if fuzz.ratio(s1,'trade license')>=60:
            s='trade license'

    
    record= dict()
    for k in taxes:
        record[k]=0
    
    
    for i in sent.split():
        for j in taxes:
            if fuzz.ratio(i,j)>=60 and fuzz.ratio(i,j)>max1:
                max1=fuzz.ratio(i,j)
                s=j
            
            


    #s=''

    #for i in record.keys():
    #    if record[i]>=1:
    #        s+=(i + ' and ')
    result = list()
    result.append(s)
    if s=='water' or s=='sewerage':
        result.append("https://onlinepaymentindia.com/wp-content/uploads/2019/01/CIDCO-Duplicate-Receipts-View-Download-Print.png")
        result.append("https://stvending.punjab.gov.in/wsbills/")
        #result.append("https://www.dbs.com/in/iwov-resources/pdf/forms-and-legal/form-15g.pdf")
    elif s=='property':
        result.append("https://4.bp.blogspot.com/_3pstdxEpDfk/S-s0R9A704I/AAAAAAAAABk/PO0BoEBHKR8/s1600/real-property-tax-recpt.jpg")
        result.append("https://amritsar.nic.in/service/property-tax-pay-online/")
        #result.append("https://minio-egov-micro-qa.egovernments.org/egov-rainmaker-1/pb/pdfgen/September/15/1600156177029consolidatedreceipt-1600156176761.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20200921%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20200921T122201Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=4007ff1eb3bde37268652eae5f609caf39c9a10da2f00a24fcc004e21aa12462")
    elif s=='trade license':
        result.append("https://www.bombayintelligence.com/file_repo/big/PUNJAB-RENEWED.jpg")
        result.append("https://cdma.ap.gov.in/en/trade-license")
        #result.append("https://minio-egov-micro-qa.egovernments.org/egov-rainmaker-1/pb/pdfgen/September/21/1600691082182tradelicense-receipt-1600691082089.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20200921%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20200921T122444Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=18189626e35541ba6ed276a0dc949111706e2d42efd91103135e5181170aae76")
    else:
        result.append("no link")
        result.append("no link")
    return result

   
"""while True:
    a= input('type something\n')
    print(ent_reg(a))"""


