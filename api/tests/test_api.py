""" API integration test """

import pytest
from api import create_app
import simplejson as json

@pytest.fixture
def app():
  app = create_app({"TESTING": True})
  yield app

@pytest.fixture()
def client(app):
    return app.test_client()

def test_index(client):
    rv = client.get('/')
    assert rv.status_code == 200
    assert rv.data.decode() == 'running'

def test_data_pagination_default_10(client):
    rv = client.get('/api/data')
    assert rv.status_code == 200
    data = json.loads(rv.data.decode())
    assert len(data['data']) == 10

def test_data_pagination_args_size_100(client):
    rv = client.get('/api/data?size=75')
    assert rv.status_code == 200
    data = json.loads(rv.data.decode())
    assert len(data['data']) == 75

def test_data_pagination_args_size_1(client):
    rv = client.get('/api/data?size=1')
    assert rv.status_code == 200
    data = json.loads(rv.data.decode())
    assert len(data['data']) == 1

def test_data_pagination_args_start(client):
    rv1 = client.get('/api/data')
    rv2 = client.get('/api/data?start=10')
    assert rv1.status_code == 200
    assert rv2.status_code == 200
    data1 = json.loads(rv1.data.decode())
    data2 = json.loads(rv2.data.decode())
    assert data1['data'][0] != data2['data'][0]

def test_data_pagination_total_size_start(client):
    rv = client.get('/api/data')
    assert rv.status_code == 200
    data = json.loads(rv.data.decode())
    assert data['total'] == 76
    assert data['start'] == 0
    assert data['size'] == 10

def test_data_find_by_line_item_name(client):
    rv = client.get('/api/data/find?name=line_item_name&value_string=Ergonomic Rubber Table - 6b53')
    assert rv.status_code == 200
    data = json.loads(rv.data.decode())
    assert len(data) == 1

def test_data_find_by_campaign_name(client):
    rv = client.get('/api/data/find?name=campaign_name&value_string=Rath-Yundt : Vision-oriented bottom-line knowledge base - 5126')
    assert rv.status_code == 200
    data = json.loads(rv.data.decode())
    assert len(data) == 38

def test_data_find_by_campaign_id(client):
    rv = client.get('/api/data/find?name=campaign_id&value_number=2')
    assert rv.status_code == 200
    data = json.loads(rv.data.decode())
    assert len(data) == 3

def test_data_aggregate(client):
    rv = client.get('/api/data/aggregate')
    assert rv.status_code == 200
    data = json.loads(rv.data.decode())
    assert len(data) == 4

def test_data_aggregate_size(client):
    rv = client.get('/api/data/aggregate?size=2')
    assert rv.status_code == 200
    data = json.loads(rv.data.decode())
    print(data)
    assert len(data["data"]) == 2

def test_data_aggregate_start(client):
    rv = client.get('/api/data/aggregate')
    rv2 = client.get('/api/data/aggregate?start=2')
    assert rv.status_code == 200
    assert rv2.status_code == 200
    data = json.loads(rv.data.decode())
    data2 = json.loads(rv2.data.decode())
    assert data != data2

def test_query_multi_match(client):
    data = {'query': 'Satterfield-Turcotte '}
    rv = client.post('/api/data/query', data=json.dumps(data), headers={"Content-Type": "application/json"})
    data = json.loads(rv.data.decode())
    assert len(data) == 35

def test_query_single_match(client):
    data = {'query': 'Practical Plastic Shirt - 24a4'}
    rv = client.post('/api/data/query', data=json.dumps(data), headers={"Content-Type": "application/json"})
    data = json.loads(rv.data.decode())
    assert len(data) == 1

def test_get_by_id(client):
    rv = client.get('/api/data/1')
    data = json.loads(rv.data.decode())
    print(data["id"])
    assert data["id"] == 1