# CampusMap ETL

This repository includes all the [Extract](extract), [Transform](transform) and [Load](load) scripts necessary to populate the CampusMap database.

## Extract
The [Extract](extract) folder contains scrapers focused on retrieving different kind of information:
- persons and rooms at the [Institute of Informatics and Telematics (IIT)](extract/iit.js);
- persons and rooms at the [Institute of Information Science and Technologies (ISTI)](extract/isti.js);
- CNR CicloPI station data about bycicle use.

## Transform
The [Transform](transform) folder contains a script for transforming the scraping output to a specific JSON structure needed for precisely organizaing data and subsequently populating databases.

## Load
[...]