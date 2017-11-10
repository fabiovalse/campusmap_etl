import sys
import json
import argparse
import pyArango
from pyArango.connection import *

parser = argparse.ArgumentParser(description='Loads an array of JSON document into ArangoDB.')
parser.add_argument('--username', metavar='u', type=str)
parser.add_argument('--password', metavar='p', type=str)
parser.add_argument('--db', metavar='d', type=str)
parser.add_argument('--coll', metavar='c', type=str)
parser.add_argument('--overwrite', action="store_true")
args = parser.parse_args()

json_data = json.loads(sys.stdin.read())

conn = Connection(arangoURL='http://campusmap:8529', username=args.username, password=args.password)

db = conn[args.db]

def get_or_create_collection(name):
    if not db.hasCollection(name):
        db.createCollection(name=name)
    return db[name]

collection = get_or_create_collection(args.coll)

if args.overwrite:
    collection.truncate()

for d in json_data:
    doc = collection.createDocument()
    doc.set(d)
    doc.save()

