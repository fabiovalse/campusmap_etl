<?php
  header("Access-Control-Allow-Origin: *");

  header('Content-type: application/json');

  $url = 'http://www.weatherlink.com/xml.php?user=pi01e&pass=050pi01';

  $html_page = file_get_contents($url);
  //$xmlinfo = simplexml_load_file($url);

  //$output2 = shell_exec('wget http://www.weatherlink.com/xml.php?user=pi01e&pass=050pi01');

  if ($html_page[0] == "\n") {
    //echo('yes');
    $str = ltrim($html_page, "\n");
    //echo($str);

    $fp = fopen("weather.xml","wb");
    if( $fp == false ){
      //do debugging or logging here
    }else{
      fwrite($fp,$str);
      fclose($fp);
    }

    $xmlinfo = simplexml_load_file("weather.xml");
  } else {
    $xmlinfo = simplexml_load_file($url);
  }
  //echo $html_page[0];

  //define date and time

  //echo($xmlinfo->observation_time_rfc822);

  $pieces = explode(", ",($xmlinfo->observation_time_rfc822))[1];


  $date_observation = explode(" \+",$pieces)[0];
  //print_r($ok);

  $date = date("d M Y H:i:s");

  // output
  $timestamp_now = strtotime($date);
  $timestamp_observation = strtotime($date_observation);


  
  //print_r(json_encode($xmlinfo));
  
  $dewpoint_c = floatval($xmlinfo->dewpoint_c);
  $heat_index_c = floatval($xmlinfo->heat_index_c);
  $pressure_mb = floatval($xmlinfo->pressure_mb);
  $relative_humidity = floatval($xmlinfo->relative_humidity);
  $temp_c = floatval($xmlinfo->temp_c);
  $wind_degrees = floatval($xmlinfo->wind_degrees);
  $wind_kt = floatval($xmlinfo->wind_kt);
  $wind_mph = floatval($xmlinfo->wind_mph);
  $windchill_c = floatval($xmlinfo->windchill_c);
  $rain_day_in = floatval($xmlinfo->davis_current_observation->rain_day_in);
  $solar_radiation = floatval($xmlinfo->davis_current_observation->solar_radiation);
  $sunrise = ($xmlinfo->davis_current_observation->sunrise);
  $sunrise = str_replace('am', '', $sunrise);
  $sunrise_hour = intval(explode(':',$sunrise)[0]);
  $sunrise_min = intval(explode(':',$sunrise)[1]);

  //echo(strlen((string) $sunrise_hour));
  
  if((strlen((string) $sunrise_hour)==1)){
    $sunrise_hour = '0'.$sunrise_hour;
  }
  if((strlen((string) $sunrise_min)==1)){
    $sunrise_min = '0'.$sunrise_min;
  }  
  $sunset = ($xmlinfo->davis_current_observation->sunset);
  $sunset = str_replace('pm', '', $sunset);
  $sunset_hour = intval(explode(':',$sunset)[0])+12;
  $sunset_min = intval(explode(':',$sunset)[1]);

  if((strlen((string) $sunset_hour)==1)){
    $sunset_hour = '0'.$sunset_hour;
  }
  if((strlen((string) $sunset_min)==1)){
    $sunset_min = '0'.$sunset_min;
  }

  $timestamp = $timestamp_observation;
  $iso8601 = date('c', $timestamp);
  //echo "ciao";

  $result = Array(
    'dewpoint_c' => $dewpoint_c, 
    'heat_index_c' => $heat_index_c,
    'pressure_mb' => $pressure_mb,
    'relative_humidity' => $relative_humidity,
    'temp_c' => $temp_c,
    'wind_degrees' => $wind_degrees,
    'wind_kt' => $wind_kt,
    'wind_mph' => $wind_mph,
    'windchill_c' => $windchill_c,
    'rain_day_in' => $rain_day_in,
    'solar_radiation' => $solar_radiation,
    'dewpoint_c' => $dewpoint_c,
    '_ts' => str_replace('+01:00', '.000Z', $iso8601),
    'sunrise' => $sunrise_hour.':'.$sunrise_min,
    'sunset' => $sunset_hour.':'.$sunset_min


  );

  echo(json_encode($result));

?>

