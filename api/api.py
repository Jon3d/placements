import simplejson as json
import copy

from functools import reduce
from flask import Flask, Response, request
from flask_cors import CORS

from boto3 import client
from botocore import UNSIGNED
from botocore.client import Config
from decimal import Decimal, ROUND_HALF_UP

# TODO: wire up s3 or dynamo (leaning away from sql just for time constraints)
# This data should also be cached, will do if time allows, graphql would be a nice addition as well
# Pull data from S3
# BUCKET = 'test-placements.io'
# FILE_TO_READ = 'placements_teaser_data.json'
# s3 = client('s3', config=Config(signature_version=UNSIGNED))
# result = s3.get_object(Bucket=BUCKET, Key=FILE_TO_READ) 
# text = result['Body'].read().decode()
# print(text['Details']) 

app = Flask(__name__)
CORS(app)
cents = Decimal('0.01')

with open('api/placements_teaser_data.json') as f:
    data = json.load(f)

def getDecimal(num):
  return Decimal(num).quantize(cents, ROUND_HALF_UP)

def getAggregate(_data, aggregate_on):
  retdata = {}
  datacopy = copy.copy(_data)
  for lineitem in datacopy:
    if aggregate_on in lineitem:
      if lineitem[aggregate_on] in retdata:
        currentBooked = getDecimal(retdata[lineitem[aggregate_on]]['booked_amount'])
        nextBooked = getDecimal(lineitem['booked_amount'])
        retdata[lineitem[aggregate_on]]['booked_amount'] = getDecimal(currentBooked + nextBooked)
        currentActual = getDecimal(retdata[lineitem[aggregate_on]]['actual_amount'])
        nextActual = getDecimal(lineitem['actual_amount'])
        retdata[lineitem[aggregate_on]]['actual_amount'] = getDecimal(currentActual + nextActual)
        currentActual = getDecimal(retdata[lineitem[aggregate_on]]['actual_amount'])
        nextActual = getDecimal(lineitem['actual_amount'])
        retdata[lineitem[aggregate_on]]['actual_amount'] = getDecimal(currentActual + nextActual)
        currentAdjustments = getDecimal(retdata[lineitem[aggregate_on]]['adjustments'])
        nextAdjustments = getDecimal(lineitem['adjustments'])
        retdata[lineitem[aggregate_on]]['adjustments'] = getDecimal(currentAdjustments + nextAdjustments)
        if aggregate_on is not 'line_item_name':
          retdata[lineitem[aggregate_on]]['line_item_names'].append(lineitem['line_item_name'])
      else: 
        # Delete id key, since it makes no sense in aggregates, assuming campaign names are unique per campaign_id
        # Adding line item names to objects for front-end filtering
        if aggregate_on is not 'line_item_name':
          lineitem['line_item_names'] = list()
          lineitem['line_item_names'].append(lineitem['line_item_name'])
          del lineitem['line_item_name']
        retdata[lineitem[aggregate_on]] = lineitem
        del retdata[lineitem[aggregate_on]]['id'] 

  return list(retdata.values())

@app.route('/')
def index():
  return 'Server Works!'
  
@app.route('/api/data', methods=['POST', 'GET'])
def get_data():
  if request.method == 'POST':
    # TODO
    return Response(response=json.dumps('done'),  status=200,  mimetype='application/json')
  if request.method == 'GET':
    start = request.args.get('start', default = 1, type = int)
    size = request.args.get('size', default = 10, type = int)
    reverse = request.args.get('reverse', default = False, type = bool)
    sort = request.args.get('sort', default = 'campaign_id', type = str)
    new_data = sorted(data, key=lambda x: x[sort], reverse=reverse)
    return Response(response=json.dumps(new_data[start - 1: (start + size) - 1]),  status=200,  mimetype='application/json')

@app.route('/api/data/aggregate', methods=['GET'])
def get_data_aggregate():
  start = request.args.get('start', default = 1, type = int)
  size = request.args.get('size', default = 10, type = int)
  aggregate_on = request.args.get('aggregate_on', default = 'campaign_id', type = str)
  return_data = getAggregate(data, aggregate_on)
  return_data_paginated = return_data[start - 1: (start + size) - 1];
  return Response(response=json.dumps(return_data_paginated), status=200,  mimetype='application/json')

@app.route('/api/data/find', methods=['GET'])
def get_data_attr_by_name_and_value():
  attr_name = request.args.get('name', default = 'campaign_name', type = str)
  attr_value = request.args.get('value', default = 0, type = str)
  retdata = [item for item in data if item[attr_name] == attr_value]
  return Response(response=json.dumps(retdata), status=200,  mimetype='application/json')
