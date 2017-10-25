import csv
import json
import math
import scale
import sys
import os.path

data_path = "../data/"

institute = sys.argv[1]

# input output data
_input = json.loads(sys.stdin.read())

output = {
  "id": _input['id'],
  "nodes": [],
  "links": [],
  "annotations": []
}

# scale creation
x = scale.Linear([0, 454.22], [1037.726, 7962.337])
y = scale.Linear([0, 454.22], [7111.417, 182.840])

# Transform a point according to the Cavalier projection
def to_cavalier(point):
  return {
    "x": float(point['x']) - (math.cos(math.pi/4) * 4.5) * float(point['z']),
    "y": float(point['y']) + (math.sin(math.pi/4) * 4.5) * float(point['z'])
  }

### ROOMS
###
rooms_label_id = {}
rooms_id_label = {}
rooms_centroid = {}

# Retrieve centroid coordinates
# CSV header: skectchup_id, x, y, z
with open(data_path+'roomid_centroid.csv') as csv_file:
  for d in csv.DictReader(csv_file, delimiter=',', quotechar='"'):
    rooms_centroid[d['id']] = d

# Retrieve centroid coordinates
# CSV header: label, skectchup_id
with open(data_path+'roomid_label.csv') as csv_file:
  for d in csv.DictReader(csv_file, delimiter=',', quotechar='"'):
    rooms_label_id[d['label']] = d['id']

# Merge data sources
for d in _input['rooms']:
  rooms_id_label[d['id']] = d['label']
  
  if d['label'] != '':
    obj = d

    if d['label'] in rooms_label_id:
      room_id = rooms_label_id[d['label']]
      
      point = to_cavalier({
        "x": rooms_centroid[room_id]['x'],
        "y": rooms_centroid[room_id]['y'],
        "z": rooms_centroid[room_id]['z']
      })

      output['annotations'].append({
        "body": d['label'],
        "target": "map@area.cnr.it",
        "floor": int(rooms_centroid[room_id]['z']),
        "ghost": False,
        "x": x.get(point['x']),
        "y": y.get(point['y'])
      })

      obj['id'] = d['label']
      obj['template'] = "room"
      obj['thumbnail'] = "img/door.png"
      obj['icon'] = "square-o"

      output['nodes'].append(obj)
    # CHECK FOR NEW ROOMS
    #else:
    #  print "-----" + d['label']

### PERSONS
###
person_room_index = {}

# Retrieve person-room relationships
for d in _input['person_room']:
  person_room_index[d['person_id']] = d['room_id']

# Retrieve persons data
for d in _input['persons']:
  d['template'] = "person"
  output['nodes'].append(d) # FIXME: change person IDs

  room_id = person_room_index[d['id']]

  # Filter persons without a room
  if rooms_id_label[room_id] != '':
    output['links'].append({
      "source": str(d['id']),
      "target": rooms_id_label[room_id],
      "type": "in"
      })

### GROUPS
###
if 'groups' in _input:
  group_persons = {}
  
  # Retrieve group-person relationships
  for d in _input['group_person']:
    if d['group_id'] in group_persons:
      group_persons[d['group_id']].append(d['person_id'])
    else:
      group_persons[d['group_id']] = [d['person_id']]

  # Retrieve groups data
  for d in _input['groups']:
    d['template'] = "group"

    old_id = d['id']
    d['id'] = "group"+str(d['id'])
    output['nodes'].append(d)

    output['links'].append({
      "source": d['id'],
      "target": institute+"@area.cnr.it",
      "type": "in"
    })

    for p in group_persons[old_id]:
      output['links'].append({
        "source": str(p),
        "target": d['id'],
        "type": "in"
      })

print json.dumps(output)