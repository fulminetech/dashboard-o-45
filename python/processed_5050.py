from flask import Flask, json
from flask_restful import reqparse, abort, Api, Resource
from flask_cors import CORS

app = Flask(__name__)
api = Api(app)
CORS(app)

# import numpy as np

import requests

# Limits Sequence
# PLHS_UL
# PLHS_LL
# MLHS_UL
# MLHS_LL
# ELHS_UL
# ELHS_LL

# PRHS_UL
# PRHS_LL
# MRHS_UL
# MRHS_LL
# ERHS_UL
# ERHS_LL

# PLHS_FL
# MLHS_FL
# ELHS_FL
# PRHS_FL
# MRHS_FL
# ERHS_FL

# AWC_PLHS_UL
# AWC_PLHS_LL
# AWC_MLHS_UL
# AWC_MLHS_LL
# AWC_PRHS_UL
# AWC_PRHS_LL
# AWC_MRHS_UL
# AWC_MRHS_LL

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
        if items > upperlimit:
            processedlist[index] = "#C0392B"
        elif items < lowerlimit:
            processedlist[index] = "#F1C40F"
        elif items >= lowerlimit and items <= upperlimit:
            processedlist[index] = "blue"
    return processedlist

def processor():

    # Make HTTP request
    r = requests.get('http://127.0.0.1:5001/api/machine/raw')

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
    eLHS = [ x/10 for x in regs4]

    regs5 = response["eRHS_data"]
    eRHS = [ x/10 for x in regs5]

    regs6 = response["avg"]
    avg = [x / 100 for x in regs6]
    #ML. PL, EL, MR, PR, ER 
    avg_new = [ avg[3], avg[0], avg[15], avg[11], avg[7], avg[19] ]

    regs7 = response["limit"]
    limit = [x / 100 for x in regs7]
    # MLHS_LL, MLHS_UL, MRHS_LL, MRHS_UL, PLHS_LL, PLHS_UL, PRHS_LL, PRHS_UL, ELHS_LL, ELHS_UL, ERHS_LL, ERHS_UL
    limit_new = [ limit[3], limit[2], limit[9], limit[8], limit[1], limit[0], limit[7], limit[6], limit[5], limit[4], limit[11], limit[10],  limit[12], limit[13],limit[14],limit[15], limit[16], limit[17], limit[18], limit[19], limit[20], limit[21], limit[22], limit[23], limit[24], limit[25] ]

    payload['connection'] = True
    payload['pLHS_data'] = pLHS 
    payload['pRHS_data'] = pRHS
    payload['mLHS_data'] = mLHS
    payload['mRHS_data'] = mRHS
    payload['eLHS_data'] = eLHS
    payload['eRHS_data'] = eRHS
    payload['pstatus'] = response["pstatus"]
    payload['avg'] = avg_new
    payload['limit'] = limit_new

    # Copy of data from raw server
    pLHS_data = payload['pLHS_data'].copy()
    pRHS_data = payload['pRHS_data'].copy()
    mLHS_data = payload['mLHS_data'].copy()
    mRHS_data = payload['mRHS_data'].copy()
    eLHS_data = payload['eLHS_data'].copy()
    eRHS_data = payload['eRHS_data'].copy()

    # MLHS_LL, MLHS_UL, MRHS_LL, MRHS_UL, PLHS_LL, PLHS_UL, PRHS_LL, PRHS_UL, ELHS_LL, ELHS_UL, ERHS_LL, ERHS_UL
    payload['mLHS_processed'] = process(mLHS_data, limit_new[0], limit_new[1])
    payload['mRHS_processed'] = process(mRHS_data, limit_new[2], limit_new[3])
    payload['pLHS_processed'] = process(pLHS_data, limit_new[4], limit_new[5])
    payload['pRHS_processed'] = process(pRHS_data, limit_new[6], limit_new[7])
    payload['eLHS_processed'] = process(eLHS_data, limit_new[8], limit_new[9])
    payload['eRHS_processed'] = process(eRHS_data, limit_new[10], limit_new[11])

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
