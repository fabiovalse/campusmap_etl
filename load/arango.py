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
parser.add_argument('--history', action="store_true")
args = parser.parse_args()

json_data = json.loads(sys.stdin.read())

conn = Connection(username=args.username, password=args.password)

db = conn[args.db]
collection = db[args.coll]

if not args.history:
    d = collection.createDocument()
    d.set(json_data)

    d.save()
else:
    for k in db.AQLQuery(f'''
        FOR d IN {args.coll}
        SORT d._ts DESC
        LIMIT 1
        RETURN d''', rawResults=True, batchSize=100):
            print(k)