import csv
import json
import math
import scale
import sys
import os.path

data_path = "../data/"

# input output data
_input = json.loads(sys.stdin.read())
source_id = _input['id']
institute = source_id.split('.')[0]

# define output structure
output = {
  "id": source_id,
  "nodes": [],
  "links": []
}

### ROOMS
###
rooms_id_label = {}

# Merge data sources
for d in _input['rooms']:
  rooms_id_label[d['id']] = d['label']

### PERSONS
###
person_room_index = {}

# Retrieve person-room relationships
for d in _input['person_room']:
  person_room_index[d['person_id']] = d['room_id']

# Retrieve persons data
for d in _input['persons']:
  d['template'] = "person"
  output['nodes'].append(d)

  # Filters people without a room
  if d['id'] in person_room_index:
    room_id = person_room_index[d['id']]

    # Filter persons without a room
    if rooms_id_label[room_id] != '':
      output['links'].append({
        "source": d['id'],
        "target": rooms_id_label[room_id]+"@area.cnr.it",
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

    output['nodes'].append(d)

    output['links'].append({
      "source": d['id'],
      "target": institute+"@area.cnr.it",
      "type": "in"
    })

    for p in group_persons[d['id']]:
      output['links'].append({
        "source": p,
        "target": d['id'],
        "type": "in"
      })

print json.dumps(output)