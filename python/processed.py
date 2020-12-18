from flask import Flask
from flask_restful import reqparse, abort, Api, Resource

app = Flask(__name__)
api = Api(app)

import requests

# # Access Nested JSON data using key name
# print("Connection: ", response["machine"]["LHS"]["maincompression_upperlimit"])

import random
randomlist = []
# Generates list of 5 elemets between 60 and 100
for i in range(0,45):
    n = random.randint(60,100)
    randomlist.append(n)

# Limits for processing the data
PLHS_LL = 50
PLHS_UL = 70
PRHS_LL = 50 
PRHS_UL = 70

MLHS_LL = 50
MLHS_UL = 70
MRHS_LL = 50
MRHS_UL = 70

ELHS_LL = 50
ELHS_UL = 70
ERHS_LL = 50
ERHS_UL = 70

# Data format: Dictonary
payload = {
    'connection': False,
    'pstatus': [],
    'pLHS_data': [],
    'pLHS_processed': [],
    'pRHS_data': [],
    'pRHS_processed': [],
    'mLHS_data': [],
    'mLHS_processed': [],
    'mRHS_data': [],
    'mRHS_processed': [],
    'eLHS_data': [],
    'eLHS_processed': [],
    'eRHS_data': [],
    'eRHS_processed': [],
    'avg': []
}

payload['pLHS_data'] = randomlist
payload['pRHS_data'] = randomlist
payload['mLHS_data'] = randomlist
payload['mRHS_data'] = randomlist
payload['eLHS_data'] = randomlist
payload['eRHS_data'] = randomlist

# payload['pstatus'] = 
# payload['avg'] = 

# print(payload)
# print(processedlist)

def process(processedlist, lowerlimit, upperlimit):
    # Values above and below limits are set red and in between are blue
    for index, items in enumerate(processedlist):
        if items > upperlimit or items < lowerlimit:
            processedlist[index] = "red"
        elif items >= lowerlimit and items <= upperlimit:
        # elif:
            processedlist[index] = "blue"
    return processedlist

def processor():
    # Copy of data from raw server
    pLHS_data = payload['pLHS_data'].copy()
    pRHS_data = payload['pRHS_data'].copy()
    mLHS_data = payload['mLHS_data'].copy()
    mRHS_data = payload['mRHS_data'].copy()
    eLHS_data = payload['eLHS_data'].copy()
    eRHS_data = payload['eRHS_data'].copy()

    payload['pLHS_processed'] = process(pLHS_data, PLHS_LL, PLHS_UL)
    payload['pRHS_processed'] = process(pRHS_data, PRHS_LL, PRHS_UL)
    payload['mLHS_processed'] = process(mLHS_data, MLHS_LL, MLHS_UL)
    payload['mRHS_processed'] = process(mRHS_data, MRHS_LL, MRHS_UL)
    payload['eLHS_processed'] = process(eLHS_data, ELHS_LL, ELHS_UL)
    payload['eRHS_processed'] = process(eRHS_data, ERHS_LL, ERHS_UL)

processor()
# print(payload)

class Payload(Resource):
    def get(self):
        if self:
            return payload
        else:
            return "Invalid Request"

api.add_resource(Payload, '/api/machine/processed')

if __name__ == '__main__':
    app.run(debug=True)