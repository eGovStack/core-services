from city_extract import *
from flask import Flask, jsonify, request, send_file

city_api = Flask(__name__)



@city_api.route('/', methods=['POST'])
def reply():
    request_data=request.get_json()
    inp= request_data['input_city']
    lang=request_data['input_lang']

    k= find_city(inp)
    response=dict()
    response['city_detected']= k[0]
    response['match']= k[1]

    return jsonify(response)

city_api.run()


