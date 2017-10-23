var fs = require('fs');
var utils = require('utils');
var x = require('casper').selectXPath;

// Casper initialization
var webPage = require('webpage');
var page = webPage.create();

var casper = require('casper').create({
    // verbose: true,
    // logLevel: 'debug',
    pageSettings: {
      loadImages:  true,
      loadPlugins: false,
      userAgent: 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.2 Safari/537.36',
      XSSAuditingEnabled: false,
      localToRemoteUrlAccessEnabled: false
    }
});

var links = [];

var persons = [];
var _rooms = [];
var person_room = [];
var room_id = 0;
var rooms = {};

// START the scraper
casper.start('http://www.isti.cnr.it/about/people.php', function() {
  // Retrieve person links
  anchors = casper.getElementsInfo('.content p a');
  anchors.forEach(function(a) {
    links.push(a.attributes.href);
  });
});

// MAIN scraping process
function open(link,i) {

  // Open PERSON link
  casper.thenOpen(link, function() {

    var person_name = casper.getElementInfo('.shallow').text.slice(0,-1);

    var email = '';
    if (casper.exists(x("//em[text() = 'email:']/following::td")))
      email = casper.getElementInfo(x("//em[text() = 'email:']/following::td")).text;
    else
      email = person_name.replace(" ",".").replace("'","").toLowerCase() + "_temporary@isti.cnr.it";

    var tel = '';
    if (casper.exists(x("//em[text() = 'office:']/following::td")))
      tel = casper.getElementInfo(x("//em[text() = 'office:']/following::td")).text.replace(/\t/g, '');

    var building  = '';
    if (casper.exists(x("//em[text() = 'building:']/following::td")))
      building = casper.getElementInfo(x("//em[text() = 'building:']/following::td")).text;

    var floor  = '';
    if (casper.exists(x("//em[text() = 'floor:']/following::td")))
      floor = casper.getElementInfo(x("//em[text() = 'floor:']/following::td")).text;

    var room  = '';
    if (casper.exists(x("//em[text() = 'room:']/following::td")))
      room = casper.getElementInfo(x("//em[text() = 'room:']/following::td")).text;

    var gateway  = '';
    if (casper.exists(x("//em[text() = 'gate:']/following::td")))
      gateway = casper.getElementInfo(x("//em[text() = 'gate:']/following::td")).text;

    var position  = '';
    if (casper.exists(".subtitle"))
      position = casper.getElementInfo(".subtitle").text;

    var photo_url = '';
    if (casper.exists('#persona-left > img'))
      photo_url = 'http://www.isti.cnr.it/' + casper.getElementInfo("#persona-left > img").attributes.src;

    persons.push({
      "id": email,
      "label": person_name,
      "position": position,
      "email": email,
      "tel": tel,
      "photo_url": photo_url,
      "url": [link]
    });

    if (!(room in rooms)) {
      rooms[room] = room_id;
      
      _rooms.push({
        "id": room_id,
        "label": room,
        "floor": floor,
        "entrance": gateway,
        "building": building
      });

      current_room_id = room_id;
      room_id++;
    } else
      current_room_id = rooms[room];

    person_room.push({
      "person_id": email,
      "room_id": current_room_id
    });

  });
}

casper.then(function() {
  links.forEach(function(l,i) {
    open('http://www.isti.cnr.it'+l,i);
  });
});

casper.on('run.complete', function() {
  utils.dump({
    "id": "isti",
    "persons": persons,
    "rooms": _rooms,
    "person_room": person_room
  });
  casper.exit();
});

casper.run();