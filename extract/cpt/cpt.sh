#!/bin/bash
#
EXEC_DATE=$(date)
echo
echo "Data e ora di esecuzione: $EXEC_DATE"

CMD=$(basename $0)
WRKF1=./${CMD}_tmp1		# Orari delle fermate a $STOP_DESCRITION
WRKF2=./${CMD}_tmp2
WRKF3=./${CMD}_tmp3
WRKF4=./${CMD}_tmp4
WRKF5=./${CMD}_tmp5
OUTF=./cpt.json	# File .json dei risultati

trap "rm -f $WRKF1 $WRKF2 $WRKF3 $WRKF4 $WRKF5 2>/dev/null ; exit" 0 1 2 3 15

STOP_TEXT="Cnr"

STOP_ID=$(grep -i "$STOP_TEXT" stops.txt | cut -d"," -f1)

echo
echo "Estrazione degli orari delle fermate a $STOP_TEXT (STOP_ID=$STOP_ID)"

STOP_TIMES=$(grep "$STOP_ID" stop_times.txt)
grep "$STOP_ID" stop_times.txt >$WRKF1

>$WRKF2

echo
echo "Estrazione dei campi:
TRIP_ID DEPARTURE_TIME 
ROUTE_ID SERVICE_ID 
ROUTE_SHORT_NAME ROUTE_LONG_NAME"
echo

cat $WRKF1 | while read RIGA1
do

   TRIP_ID=$(echo $RIGA1 | cut -d"," -f1)
   DEPARTURE_TIME=$(echo $RIGA1 | cut -d"," -f3)
   echo -n "${TRIP_ID} " >>$WRKF2
   echo -n "${DEPARTURE_TIME} " >>$WRKF2

   ROUTE_ID=$(grep "$TRIP_ID" trips.txt | cut -d"," -f1)
   SERVICE_ID=$(grep "$TRIP_ID" trips.txt | cut -d"," -f2)
   echo -n "${SERVICE_ID} " >>$WRKF2
   echo -n "${ROUTE_ID} " >>$WRKF2

   ROUTE_SHORT_NAME=$(grep "$ROUTE_ID" routes.txt | cut -d"," -f3)
   ROUTE_LONG_NAME=$(grep "$ROUTE_ID" routes.txt | cut -d"," -f4)
   echo -n "${ROUTE_SHORT_NAME} " >>$WRKF2
   echo -n "${ROUTE_LONG_NAME} " >>$WRKF2
   echo >>$WRKF2

done

echo "Creazione del file .json"
echo

INC=0

CNTREC=0

echo '[{"bus_stop_name":"Fermata Bus San Cataldo", "data":' >$WRKF5
echo "[" >>$WRKF5

NDAYS=7

while [ $INC -lt $NDAYS ]

do

  SEARCH_DATE=$(date '+%C%y%m%d' -d "+$INC days")
  echo "SEARCH_DATE=$SEARCH_DATE <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
  echo "  {\"date\":\"$SEARCH_DATE\",\"timetable\":" >>$WRKF5
  echo "  [" >>$WRKF5

  >$WRKF4

  grep $SEARCH_DATE calendar_dates.txt >$WRKF3

  cat $WRKF3 | while read RIGA3

  do

    SERVICE_ID=$(echo $RIGA3 | cut -d"," -f1) 

    # echo "SERVICE_ID = $SERVICE_ID"

    if [ ! -z $SERVICE_ID ]; then

       grep $SERVICE_ID $WRKF2 >>$WRKF4

       NREC=$(wc -l $WRKF4 | cut -d" " -f1)

   fi

  done

  sort -o $WRKF4 -k 1.17,1.24 $WRKF4

  NREC=$(wc -l $WRKF4 | cut -d" " -f1)
  echo "NREC=$NREC ========================================"

  # NREC = numero delle righe estratte in WRKF4.
  # Quando queste righe vengono processate bisogna contarle
  # e omettere il carattere "," alla fine dell'ultima riga estratta.
  # Riga normale:
  #    echo "    {\"time\":$TIME,\"bus_name\":$BUS_NAME,\"end_station\":$END_STATION}," >>$WRKF5
  # Ultima riga:
  #    echo "    {\"time\":$TIME,\"bus_name\":$BUS_NAME,\"end_station\":$END_STATION}" >>$WRKF5

  if [ $NREC -ne 0 ]; then
    
     cat $WRKF4 | while read RIGA4

     do

       TIME=$(echo $RIGA4 | awk -F ' \"' '{print $2}')

       BUS_NAME=$(echo $RIGA4 | awk -F ' \"' '{print $5}')

       END_STATION=$(echo $RIGA4 | awk -F ' \"' '{print $6}')

       CNTREC=$(( $CNTREC + 1 ))
       # echo "NREC=$NREC / CNTREC=$CNTREC"
            
       if [ $NREC -ne $CNTREC ]; then
          echo "    {\"time\":\"$TIME,\"bus_name\":\"$BUS_NAME,\"end_station\":\"$END_STATION}," >>$WRKF5
       else
          echo "    {\"time\":\"$TIME,\"bus_name\":\"$BUS_NAME,\"end_station\":\"$END_STATION}" >>$WRKF5
       fi

     done

  fi

  INC=$(( $INC + 1 ))

  if [ $INC -ne $NDAYS ]; then
     echo "  ]" >>$WRKF5
     echo "  }," >>$WRKF5
  else
     echo "  ]" >>$WRKF5
     echo "  }" >>$WRKF5
  fi

done

echo "]" >>$WRKF5
echo "}]" >>$WRKF5

# Formattazione del file di output json tramite il comando "json"

echo
echo "Formattazione del file .json"

# cat $WRKF5 | json >$OUTF
cp $WRKF5 $OUTF

