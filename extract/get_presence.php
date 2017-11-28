<?php  
  header('Content-Type: application/json');

  $room_names = [
    'C69' => 'C-69',
    'C70' => 'C-70',
    'C70a' => 'C-70a',
    'C71' => 'C-71',
    'C73' => 'C-73',
    'C62' => 'C-62',
    'C63' => 'C-63',
    'C64' => 'C-64',
    'C66' => 'C-66'];

  $uri = "your URI here";
  $c = new MongoClient( $uri );
  $db = $c->sensorweaver;

  $collection = $db->data;
  $result = [];

  foreach($room_names as $room_name => $room_name_campusmap){
    $cursor = $collection
      ->find(['dataFeedId' => 'room_presence', 'values.room' => $room_name])
      ->sort(array("timestamp" => -1))
      ->limit(1);
    foreach($cursor as $document){
      $result_doc = [
        '_t' => date('c', $document['timestamp']/1000),
        'room' => $room_name_campusmap . '@area.cnr.it',
        'presence' => $document['values']['presence'] == 'true' // convert string into boolean
      ];

      $result[] = $result_doc;
    }
  }

  echo json_encode($result);
?>
