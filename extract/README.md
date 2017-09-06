# EXTRACT

## iit.js

This scraper retrieves information about people working at the Institute of Informatics and Telematics (IIT) starting from the URL http://www.iit.cnr.it/en/institute/people. To run the scraper type:
```
casperjs --ignore-ssl-errors=true --ssl-protocol=any iit.js
```

The scraper returns on the standard output a JSON string structured as follows:
```
{
  "id": "iit",
  "groups": [...],
  "persons": [...],
  "group_person": [...],
  "supervisor_group": [...],
  "rooms": [...],
  "person_room": [...]
}
```

## isti.js

This scraper retrieves information about people working at the Institute of Information Science and Technologies (ISTI) starting from the URL http://www.isti.cnr.it/about/people.php. To run the scraper type:
```
casperjs --ignore-ssl-errors=true --ssl-protocol=any isti.js
```

The scraper returns on the standard output a JSON string structured as follows:
```
{
  "id": "isti",
  "persons": [...],
  "rooms": [...],
  "person_room": [...]
}
```

## ciclopi.js

This scraper retrieves information about bicycles offered by the CicloPI service near the building of CNR. To run the scraper type:
```
casperjs --ignore-ssl-errors=true --ssl-protocol=any ciclopi.js
```