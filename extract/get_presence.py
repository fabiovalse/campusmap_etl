import json
import pymongo
client = pymongo.MongoClient('mongodb://guest:mongo-guest123@gru.isti.cnr.it:27017/sensorweaver')

db = client.sensorweaver
collection = db.data

room_names = {
  'C69': 'C-69',
  'C70': 'C-70',
  'C70a': 'C-70a',
  'C71': 'C-71',
  'C73': 'C-73',
  'C62': 'C-62',
  'C63': 'C-63',
  'C64': 'C-64',
  'C66': 'C-66'
}

result = []

for room_name, room_name_campusmap in room_names.items():
  cursor = collection \
    .find({'dataFeedId': 'room_presence', 'values.room': room_name}) \
    .sort([('timestamp', pymongo.DESCENDING)]) \
    .limit(1)

  for document in cursor:
    d = {
      '_t': str(document['isodate']),
      'room': room_name_campusmap + '@area.cnr.it',
      'presence': document['values']['presence'] == 'true'
    }
    result.append(d)

print(json.dumps(result))
