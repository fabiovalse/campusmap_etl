#!/bin/bash
#
#wget http://dati.toscana.it/dataset/rt-oraritb/resource/70d34dbc-259e-4051-b51e-979ace4fcc9b -O - 2>/dev/null | grep -oP 'href="\Khttp:.+?"' | sed 's/"//' | grep gtfs | sed '2d' >url.txt
RESOURCE="$(wget http://dati.toscana.it/dataset/rt-oraritb -O - 2>/dev/null | grep 'title="CPT.gtfs"' | cut -d ' ' -f5 | cut -d '=' -f2 | sed 's/"//'g)"
RESOURCE='http://dati.toscana.it'$RESOURCE
echo $RESOURCE
wget $RESOURCE -O - 2>/dev/null | grep -oP 'href="\Khttp:.+?"' | sed 's/"//' | grep gtfs | sed '2d' >url.txt
URL="$(grep 'http' url.txt)"
wget "${URL}"
unzip cpt.gtfs*
sh cpt.sh
echo
rm -v cpt.gtfs* *.txt

