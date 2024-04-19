import json

from functools import reduce
from flask import Flask, Response, request
from flask_cors import CORS

from boto3 import client
from botocore import UNSIGNED
from botocore.client import Config

# TODO: wire up s3 or dynamo (leaning away from sql just for time constraints)
# This data should also be cached, will do if time allows
# Pull data from S3
# BUCKET = 'test-placements.io'
# FILE_TO_READ = 'placements_teaser_data.json'
# s3 = client('s3', config=Config(signature_version=UNSIGNED))
# result = s3.get_object(Bucket=BUCKET, Key=FILE_TO_READ) 
# text = result['Body'].read().decode()
# print(text['Details']) 

app = Flask(__name__)
CORS(app)

with open('api/placements_teaser_data.json') as f:
    data = json.load(f)
    for i in data:
        print(i)

@app.route('/')
def index():
  return 'Server Works!'
  
@app.route("/api/data", methods=["POST", "GET"])
def use_data():
  if request.method == "POST":
    # TODO
    return 'done'
  if request.method == "GET":
    resp = Response(response=json.dumps(data), status=200,  mimetype="application/json")
    return resp

@app.route("/api/data/aggregate", methods=["GET"])
def use_data_aggregate():
  page = request.args.get('start', default = 0, type = int)
  page = request.args.get('page', default = 1, type = int)
  size = request.args.get('size', default = 10, type = int)
  page = request.args.get('aggregate_on', default = 'campaign_id', type = str)
  agg_data = 
  resp = Response(response=json.dumps(data), status=200,  mimetype="application/json")
  return resp