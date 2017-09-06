import sys
import json
import pyArango
from pyArango.connection import *

json_data = json.loads(sys.stdin.read())

conn = Connection(username="root", password="c25a2017")

db = conn["campusmap"]
collection = db["Prova"]

d = collection.createDocument()
d.set(json_data)

d.save()