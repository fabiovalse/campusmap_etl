import sys
import json
import argparse
import pyArango
from pyArango.connection import *

parser = argparse.ArgumentParser(description='Loads a JSON document into ArangoDB.')
parser.add_argument('--username', metavar='u', type=str)
parser.add_argument('--password', metavar='p', type=str)
parser.add_argument('--db', metavar='d', type=str)
parser.add_argument('--coll', metavar='c', type=str)
args = parser.parse_args()

json_data = json.loads(sys.stdin.read())

conn = Connection(username=args.username, password=args.password)

db = conn[args.db]
collection = db[args.coll]

d = collection.createDocument()
d.set(json_data)

d.save()