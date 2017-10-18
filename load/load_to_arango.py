import sys
import json
import argparse
import pyArango
from pyArango.connection import *

# Input parameters
parser = argparse.ArgumentParser(description='Loads a JSON document into ArangoDB.')
parser.add_argument('--username', metavar='u', type=str)
parser.add_argument('--password', metavar='p', type=str)
parser.add_argument('--db', metavar='d', type=str)
args = parser.parse_args()

# Input data from STDIN
json_data = json.loads(sys.stdin.read())

# Connect to ArangoDB
conn = Connection(arangoURL='http://campusmap:8529', username=args.username, password=args.password)
db = conn[args.db]

def get_or_create_collection(name):
  '''Create a new collection if name does not exist and returns it'''
  if not db.hasCollection(name):
      db.createCollection(name=name)
  return db[name]

def new_doc(datum, collection, props):
  ''' Create a new document in a specific collection.
      The _key of each document can be set by passing it within props.
      props is a list like [{"key": "_key", "value": "ID123456"}]'''
  d = collection.createDocument()
  d.set(datum)

  for p in props:
    d[p['prop_name']] = p['prop_value']

  # save into normal collection
  d.save()

def get_value(d):
  return d[0] if isinstance(d, list) else d

def clean(s):
  return s.strip().replace(' ', '')

def suffix(s):
  return s+"@"+json_data['id']

# Get Arango node and link collections
node_coll = get_or_create_collection('CampusMap_nodes')
link_coll = get_or_create_collection('CampusMap_links')

# Node index
node_index = {}

# Add NODES to Arango
for d in json_data['nodes']:
  # Define the ArangoDB document _key
  k = 'id'
  # change person ID to email
  if 'template' in d and d['template'] == 'person':
    k = 'email'
  
  # Filter nodes without a valid ID
  if d[k] != "":
    if isinstance(d[k], list):
      _key = d[k][0]
    else:
      d[k] = clean(d[k])
      _key = d[k]

    _key = _key if 'template' in d and d['template'] == 'person' else suffix(_key)

    # Set _key
    d['_key'] = _key
    # Save old node ID
    old_id = str(d['id'])
    # Remove id property from node
    d.pop('id', None)
    # Update the index
    node_index[old_id] = d

    # Create document
    new_doc(d, node_coll, [{"prop_name": "_key", "prop_value": _key}])

print('Computed nodes')

# Add LINKS and ANNOTATIONS to Arango
for d in json_data['links']+json_data['annotations']:

  _from_key = 'source' if 'source' in d else 'body'
  _from = node_index[d[_from_key]]['_key'] if d[_from_key] in node_index else clean(d[_from_key])
  
  _to = node_index[d['target']]['_key'] if d['target'] in node_index else clean(d['target'])

  d.pop('body', None)
  d.pop('source', None)
  d.pop('target', None)

  new_doc(
    d,
    link_coll,
    [
      {"prop_name": "_from", "prop_value": 'CampusMap_nodes/'+_from},
      {"prop_name": "_to", "prop_value": 'CampusMap_nodes/'+_to}
    ]
  )

print('Computed links')
