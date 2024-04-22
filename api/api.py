import simplejson as json
import copy

from functools import reduce
from flask import Flask, Response, request
from flask_cors import CORS

import requests
from decimal import Decimal, ROUND_HALF_UP

# API key for aws api gateway passthrough for s3 data
# Data would be better served from different storage such as sql or 
# Dynamo but for time saving, just using s3 for test
# Also key data shouldn't be stored in repo
API_KEY = 'zJl5BRr6JE2oQzUQxrRTx9EWHMDyOjpy5QBd0ZJp'

def create_app(config):
  app = Flask(__name__)
  app.config['TESTING'] = config.get('TESTING')
  CORS(app)
  cents = Decimal('0.01')

  if (config.get('TESTING') == False):
    res = requests.get(
      "https://v9h86p05sd.execute-api.us-east-1.amazonaws.com/test/pio-api-data/pio_data_original.json",
      headers={'x-api-key': API_KEY}
    )
    data = res.json()
  else:
    with open('test-data.json') as f:
      data = json.load(f)

  def getDecimal(num):
    return Decimal(num).quantize(cents, ROUND_HALF_UP)

  def getAggregate(_data, aggregate_on):
    retdata = {}
    datacopy = copy.deepcopy(_data)
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
          if aggregate_on != 'line_item_name':
            retdata[lineitem[aggregate_on]]['line_item_names'].append(lineitem['line_item_name'])
        else: 
          # Delete id key, since it makes no sense in aggregates, assuming campaign names are unique per campaign_id
          # Adding line item names to objects for front-end filtering
          if aggregate_on != 'line_item_name':
            lineitem['line_item_names'] = list()
            lineitem['line_item_names'].append(lineitem['line_item_name'])
            del lineitem['line_item_name']
          retdata[lineitem[aggregate_on]] = lineitem
          del retdata[lineitem[aggregate_on]]['id'] 

    return list(retdata.values())

  @app.route('/')
  def index():
    return Response(response='running',  status=200,  mimetype='application/json')
    
  @app.route('/api/data', methods=['POST', 'GET'])
  def get_data():
    if request.method == 'POST':
      # TODO: POST/PUT if time allows
      return Response(response=json.dumps('done'),  status=200,  mimetype='application/json')
    if request.method == 'GET':
      start = request.args.get('start', default = 0, type = int)
      size = request.args.get('size', default = 10, type = int)
      reverse = request.args.get('reverse', default = False, type = bool)
      sort = request.args.get('sort', default = 'campaign_id', type = str)
      print("reverse")
      print(reverse)
      new_data = sorted(data, key=lambda x: x[sort], reverse=reverse)
      response = {
        'size': size,
        'start': start,
        'total': len(new_data),
        'data': new_data[start: (start + size)]
      }
      return Response(response=json.dumps(response),  status=200,  mimetype='application/json')

  @app.route('/api/data/aggregate', methods=['GET'])
  def get_data_aggregate():
    start = request.args.get('start', default = 0, type = int)
    size = request.args.get('size', default = 10, type = int)
    aggregate_on = request.args.get('aggregate_on', default = 'campaign_id', type = str)
    return_data = getAggregate(data, aggregate_on)
    return_data_paginated = return_data[start: (start + size)];
    return Response(response=json.dumps(return_data_paginated), status=200,  mimetype='application/json')

  @app.route('/api/data/find', methods=['GET'])
  def get_data_attr_by_name_and_value():
    attr_name = request.args.get('name', default = 'campaign_name', type = str)
    attr_value_number = request.args.get('value_number', default = 0, type = int)
    attr_value_string = request.args.get('value_string', default = 0, type = str)
    retdata = [item for item in data if item[attr_name] == attr_value_string or item[attr_name] == attr_value_number]
    return Response(response=json.dumps(retdata), status=200,  mimetype='application/json')
  
  return app
  
app = create_app({'TESTING': False})

if __name__ == '__main__':
    app.run()
