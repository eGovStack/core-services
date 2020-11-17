import json
from flask import Flask, jsonify, request, send_file
import requests

while True:
    n=input("Type your preferred language\n")
    k = input("Type your city\n")
    m={"input_city":k,"input_lang":n}
    
    response=requests.post(url="http://127.0.0.1:5000", data=json.dumps(m), headers={"Content-Type": "application/json"})
    possibles=json.loads(response.text)["city_detected"]
    answer="Did you mean any of the following ?\n"
    counter=1
    for i in possibles:
        if i!="Please try again":
            answer+=(str(counter)+'.'+i.upper()+'\n')
        counter+=1
    answer+="Type 'mseva' to return to the main menu\n"

    if(possibles[0]==k.lower()):
        print("City detected --> "+possibles[0].upper())
        
    elif(len(possibles)==1 and possibles[0]=="Please try again"):
        print ("Sorry, I did not understand that\n")
        g=input("Press 1 to enter the city again or type 'mseva' to go to the main menu\n")
        if(g=='mseva'):
            quit()
    
    else:
        print (answer)
        l=input()
        if l=='mseva':
            quit()
        while((l<'1' or int(l)>len(possibles)) and str(l)!='mseva'):
            print("Please enter a valid number or type 'mseva' to go back to main menu\n")
            l=input()
        if l=='mseva':
            quit()
        else:
            print ("City detected --> "+possibles[int(l)-1].upper()+'\n')
        
