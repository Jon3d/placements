import simplejson as json
import copy
import flask_excel as excel

from functools import reduce
from flask import Flask, Response, request
from flask_cors import CORS

import requests
from decimal import Decimal, ROUND_HALF_UP

# API key for aws api gateway passthrough for s3 data
# Data would be better served from different storage such as sql or 
# Dynamo but for time saving, just using s3 for test
# API key shouldn't be stored in repo
API_KEY = ''

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
          retdata[lineitem[aggregate_on]]['booked_amount'] = getDecimal(currentBooked) + getDecimal(nextBooked)
          currentActual = getDecimal(retdata[lineitem[aggregate_on]]['actual_amount'])
          nextActual = getDecimal(lineitem['actual_amount'])
          retdata[lineitem[aggregate_on]]['actual_amount'] = getDecimal(currentActual) + getDecimal(nextActual)
          currentActual = getDecimal(retdata[lineitem[aggregate_on]]['actual_amount'])
          nextActual = getDecimal(lineitem['actual_amount'])
          retdata[lineitem[aggregate_on]]['actual_amount'] = getDecimal(currentActual) + getDecimal(nextActual)
          currentAdjustments = getDecimal(retdata[lineitem[aggregate_on]]['adjustments'])
          nextAdjustments = getDecimal(lineitem['adjustments'])
          retdata[lineitem[aggregate_on]]['adjustments'] = getDecimal(currentAdjustments) + getDecimal(nextAdjustments)
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
    sort = request.args.get('sort', default = 'actual_amount', type = str)
    reverse = request.args.get('reverse', default = False, type = bool)
    agg_data = getAggregate(data, aggregate_on)
    agg_data = sorted(agg_data, key=lambda x: x[sort], reverse=reverse)
    response = {
      'size': size,
      'start': start,
      'total': len(agg_data),
      'data': agg_data[start: (start + size)]
    }
    return Response(response=json.dumps(response), status=200,  mimetype='application/json')
  
  @app.route('/api/data/query', methods=['POST'])
  def get_query():
    json_data = request.get_json()
    query = str(json_data['query'])
    results = [] 
    for item in copy.deepcopy(data):
      for key, val in item.items(): 
        if str(val).__contains__(query): 
          results.append(item) 
          break;

    return Response(response=json.dumps(results), status=200,  mimetype='application/json')
  

  @app.route('/api/data/find', methods=['GET'])
  def get_data_attr_by_name_and_value():
    # Would be better supported by elasticsearch or graphql
    attr_name = request.args.get('name', default = 'campaign_name', type = str)
    attr_value_number = request.args.get('value_number', default = 0, type = int)
    attr_value_string = request.args.get('value_string', default = 0, type = str)
    retdata = [item for item in data if item[attr_name] == attr_value_string or item[attr_name] == attr_value_number]

    return Response(response=json.dumps(retdata), status=200,  mimetype='application/json')
  
  @app.route("/api/data/export", methods=['GET'])
  def export_records():
      # Supports xlsx, and csv
      type = request.args.get('type', default = 'csv', type = str)
      rData = [['Campaign ID', 'Campaign Name', 'Line Item Name', 'Booked Amount', 'Actual Amount', 'Adjustments']];
      for line in data:
        row = [
          line['campaign_id'],
          line['campaign_name'],
          line['line_item_name'],
          getDecimal(line['booked_amount']),
          getDecimal(line['actual_amount']),
          getDecimal(line['adjustments'])
        ]
        rData.append(row)
      return excel.make_response_from_array(rData, type, file_name="export_data")
  
  @app.route("/api/data/<id>", methods=['PUT'])
  def update_record(id):
      # Supports xlsx, and csv
      json_data = request.get_json()
      item = [item for item in data if int(item['id']) == int(id)]
      if len(item) == 1:
        item[0]['adjustments'] = float(json_data['adjustments'])
      else:
        return Response(response=json.dumps({'success': False}), status=400,  mimetype='application/json')
      # TODO: handle failures, actually save data, not use s3
      return Response(response=json.dumps({'success': True}), status=200,  mimetype='application/json')

  @app.route("/api/data/<id>", methods=['GET'])
  def get_record(id):
      item = [item for item in data if int(item['id']) == int(id)]
      if len(item) == 0: 
        return Response(response=json.dumps({'success': False}), status=400,  mimetype='application/json')
      # TODO: handle failures, actually save data, not use s3
      return Response(response=json.dumps(item[0]), status=200,  mimetype='application/json')
  
  return app
  
app = create_app({'TESTING': False})
excel.init_excel(app)

if __name__ == '__main__':
    app.run()
