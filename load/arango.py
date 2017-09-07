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

conn = Connection(arangoURL='http://campusmap:8529', username=args.username, password=args.password)

db = conn[args.db]

def get_or_create_collection(name):
    if not db.hasCollection(name):
        db.createCollection(name=name)
    return db[name]

collection = get_or_create_collection(args.coll)

def new_doc():
    '''Create a new document'''
    d = collection.createDocument()
    # create start and end timestamps
    json_data['_start'] = json_data['_ts']
    json_data['_end'] = json_data['_ts']
    del json_data['_ts']
    d.set(json_data)
    # save into normal collection
    d.save()

def update_doc_ts(doc):
    '''Update doc timestamps to current'''
    # move end timestamp to current timestamp
    doc['_end'] = json_data['_ts']
    # save into normal collection
    doc.save()

def move_to_history(doc):
    '''Move old data to history collection'''
    shadow_collection = get_or_create_collection(args.coll+'_history')
    d = shadow_collection.createDocument()
    d.set(doc.getStore())
    d.save()
    doc.delete()

if not args.history:
    d = collection.createDocument()
    d.set(json_data)

    d.save()
else:
    results = db.AQLQuery("""
        FOR d IN %s
        SORT d._end DESC
        LIMIT 1
        RETURN {data: d, unchanged: UNSET(d,'_start','_end','_key','_id','_rev') == UNSET(%s,'_ts','_key','_id','_rev')}""" % (args.coll, json.dumps(json_data)), rawResults=True, batchSize=100)
    
    if len(results) == 0:
        # no records yet -- add a new one
        new_doc()
    else:
        # update last record 'end' timestamp
        last = collection.fetchDocument(results[0]['data']['_key'])
        update_doc_ts(last)

        if not results[0]['unchanged']:
            # if data is different, store the new values and put the old
            # ones into the history collection
            new_doc()
            move_to_history(last)
