from flask import Flask
from flask_restful import reqparse, abort, Api, Resource
from flask_cors import CORS

app = Flask(__name__)
api = Api(app)
CORS(app)

import numpy as np

import requests

# Limits for processing the data
# MLHS_LL, MLHS_UL, MRHS_LL, MRHS_UL, PLHS_LL, PLHS_UL, PRHS_LL, PRHS_UL, ELHS_LL, ELHS_UL, ERHS_LL, ERHS_UL

PLHS_LL = 50
PLHS_UL = 70
PRHS_LL = 50
PRHS_UL = 70

MLHS_LL = 20
MLHS_UL = 70
MRHS_LL = 20
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

    # Make HTTP request
    r = requests.get('http://127.0.0.1:5000/api/machine/raw')

    # Convert response to JSON
    response = r.json()

    regs = response["pLHS_data"]
    pLHS = [ x/100 for x in regs]

    regs1 = response["pRHS_data"]
    pRHS = [ x/100 for x in regs1]

    regs2 = response["mLHS_data"]
    mLHS = [ x/100 for x in regs2]

    regs3 = response["mRHS_data"]
    mRHS = [ x/100 for x in regs3]

    regs4 = response["eLHS_data"]
    eLHS = [ x/100 for x in regs4]

    regs5 = response["eRHS_data"]
    eRHS = [ x/100 for x in regs5]

    regs6 = response["avg"]
    avg = [ x/100 for x in regs6]

    regs7 = response["limit"]
    limit = [ x/100 for x in regs7]

    payload['connection'] = True
    payload['pLHS_data'] = pLHS 
    payload['pRHS_data'] = pRHS
    payload['mLHS_data'] = mLHS
    payload['mRHS_data'] = mRHS
    payload['eLHS_data'] = eLHS
    payload['eRHS_data'] = eRHS
    payload['pstatus'] = response["pstatus"]
    payload['avg'] = avg
    payload['limit'] = limit

    # Copy of data from raw server
    pLHS_data = payload['pLHS_data'].copy()
    pRHS_data = payload['pRHS_data'].copy()
    mLHS_data = payload['mLHS_data'].copy()
    mRHS_data = payload['mRHS_data'].copy()
    eLHS_data = payload['eLHS_data'].copy()
    eRHS_data = payload['eRHS_data'].copy()

    # MLHS_LL, MLHS_UL, MRHS_LL, MRHS_UL, PLHS_LL, PLHS_UL, PRHS_LL, PRHS_UL, ELHS_LL, ELHS_UL, ERHS_LL, ERHS_UL
    payload['mLHS_processed'] = process(mLHS_data, limit[0], limit[1])
    payload['mRHS_processed'] = process(mRHS_data, limit[2], limit[3])
    payload['pLHS_processed'] = process(pLHS_data, limit[4], limit[5])
    payload['pRHS_processed'] = process(pRHS_data, limit[6], limit[7])
    payload['eLHS_processed'] = process(eLHS_data, limit[8], limit[9])
    payload['eRHS_processed'] = process(eRHS_data, limit[10], limit[11])

# print(payload)

class Payload(Resource):
    def get(self):
        if self:
            processor()
            return payload
        else:
            return "Invalid Request"

api.add_resource(Payload, '/api/machine/processed')

if __name__ == '__main__':
    app.run(debug=True, port=5050)