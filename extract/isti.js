var fs = require('fs');
var utils = require('utils');
var x = require('casper').selectXPath;

// Casper initialization
var webPage = require('webpage');
var page = webPage.create();

var casper = require('casper').create({
    //verbose: true,
    //logLevel: 'debug',
    pageSettings: {
      loadImages:  true,
      loadPlugins: false,
      userAgent: 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.2 Safari/537.36',
      XSSAuditingEnabled: false,
      localToRemoteUrlAccessEnabled: false
    }
});

// Final output data structures
var groups = [];
var supervisor_group = [];
var persons = [];
var group_person = [];
var rooms = [];
var person_room = [];
var istituto = "@isti.cnr.it";

// URLs from which the scraper will start
var seed_urls = [
  {'url': 'http://www.isti.cnr.it/about/people.php?mode=bygroup', 'name': 'Servizi', 'tipo': 'Servizi Generali'},
  {'url': 'http://www.isti.cnr.it/research/unit.php?unit=', 'name': 'WN', 'tipo': 'Gruppo di Ricerca'},
  {'url': 'http://www.isti.cnr.it/research/unit.php?unit=', 'name': 'FMT', 'tipo': 'Gruppo di Ricerca'},
  {'url': 'http://www.isti.cnr.it/research/unit.php?unit=', 'name': 'SEDC', 'tipo': 'Gruppo di Ricerca'},
  {'url': 'http://www.isti.cnr.it/research/unit.php?unit=', 'name': 'SSE', 'tipo': 'Gruppo di Ricerca'},
  {'url': 'http://www.isti.cnr.it/research/unit.php?unit=', 'name': 'HIIS', 'tipo': 'Gruppo di Ricerca'},
  {'url': 'http://www.isti.cnr.it/research/unit.php?unit=', 'name': 'KDD', 'tipo': 'Gruppo di Ricerca'},
  {'url': 'http://www.isti.cnr.it/research/unit.php?unit=', 'name': 'NeMIS', 'tipo': 'Gruppo di Ricerca'},
  {'url': 'http://www.isti.cnr.it/research/unit.php?unit=', 'name': 'HPC', 'tipo': 'Gruppo di Ricerca'},
  {'url': 'http://www.isti.cnr.it/research/unit.php?unit=', 'name': 'SI', 'tipo': 'Gruppo di Ricerca'},
  {'url': 'http://www.isti.cnr.it/research/unit.php?unit=', 'name': 'VC', 'tipo': 'Gruppo di Ricerca'},
  {'url': 'http://www.isti.cnr.it/research/unit.php?unit=', 'name': 'MMS', 'tipo': 'Gruppo di Ricerca'},
  {'url': 'http://www.isti.cnr.it/research/unit.php?unit=', 'name': 'SFD', 'tipo': 'Gruppo di Ricerca'}
]

var group_id = 0;
var supervisor_id = 0;
var supervisor_href = '';
var stanza_id = 0;
var urls_people = [];
var array_rooms = [];
var research_group_links = [];
var people = [];
var group_type = '';
var room_id = 0;
var id_person;

// START the scraper
casper.start('http://www.isti.cnr.it/about/people.php', function() {});

// MAIN scraping process
casper.then(function() {
  var webpage = '';
  seed_urls.forEach(function(a) {
    if(a.name != 'Servizi'){
    // Gruppi di ricerca
      casper.thenOpen(a.url+a.name, function(d,i) {
        group_id++;

        var name = casper.getElementInfo('.content.column.span-17.last h2').text.trim().split(' ('+a.name)[0];
        
        var supervisor_href = casper.getElementInfo(x("//em[text() = 'Head:']/following::a")).attributes.href;

        if (casper.exists(x("//em[text() = 'Web:']/following::a"))){
          webpage = casper.getElementInfo(x("//em[text() = 'Web:']/following::a")).attributes.href;
        }
        else {
          webpage = '';
        }
        var description = '';
        if (casper.exists('div.content p')) {
          casper.getElementsInfo('div.content p').forEach(function(d){
            if(!(d.text.indexOf('Head:') > -1) && !(d.text.indexOf('Web:') > -1)) {
              description+= d.text.trim().replace(/\n/g, ' ').replace(/\t/g, ' ').replace(/      /g, ' ').replace(/  /g, ' ')+" ";
            }
          });
        }
        else {
          description = "";
          var tipo = "";     
        }

        groups.push({
          "id": "group"+group_id+""+istituto,
          "label": name.trim(),
          "description": description.trim(),
          "type": a.tipo,
          "url": a.url+a.name,
          "webpage": webpage
        });

        // PERSON
        casper.thenOpen(a.url+a.name+'&section=people', function() {
          
          casper.getElementsInfo('div.content p a').forEach(function(d) {
                      
            var href = d.attributes.href;

            var person_in_array = false;

            for (var i = 0; i<persons.length; i++) {
              if (persons[i]['url'] == 'http://www.isti.cnr.it'+href) {
                person_in_array = true;
                id_ok = persons[i]['id'];
              }
            }
            
            if (!person_in_array) {
              
              casper.thenOpen('http://www.isti.cnr.it'+href, function() {

                var person_name = casper.getElementInfo('.shallow').text.slice(0,-1);
          
                var email = '';
                if (casper.exists(x("//em[text() = 'email:']/following::td"))){
                  email = casper.getElementInfo(x("//em[text() = 'email:']/following::td")).text;
                  id_person = email
                } else {
                  id_person = person_name.replace(/ /g,".").replace(/'/g,"").toLowerCase() + "_temporary@isti.cnr.it";
                }

                if (href == supervisor_href) {
                  supervisor_group.push({
                    "id_referente": id_person,
                    "id_gruppo": "group"+group_id+""+istituto
                  });
                };

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
                  "id": id_person,
                  "label": person_name,
                  "position": position,
                  "email": email,
                  "tel": tel,
                  "photo_url": photo_url,
                  "url": 'http://www.isti.cnr.it'+href

                });

                group_person.push({
                  "person_id": id_person,
                  "group_id": "group"+group_id+""+istituto
                });
                
                var room_in_array = false;
                for (var i = 0; i<rooms.length; i++) {
                  if (rooms[i]['label'] == room) {
                    room_in_array = true;
                  }
                }
                
                if (!room_in_array) {
                  if (room != ''){
                    stanza_id++;
                    rooms.push({
                      "id": stanza_id,
                      "label": room,
                      "floor": floor,
                      "entrance": gateway,
                      "building": building
                    });

                    person_room.push({
                      "person_id": id_person,
                      "room_id": stanza_id
                    });
                    
                  }
                  
                } else {
                
                  for (var i = 0; i<rooms.length; i++) {
                    if (rooms[i]['label'] == room) {
                      id_stanza_ok = rooms[i]['id'];
                      
                      person_room.push({
                        "person_id": id_person,
                        "room_id": id_stanza_ok
                      });   
                    }
                  };
                };                  
              });      
            } else {
              group_person.push({
                "person_id": id_ok,
                "group_id": "group"+group_id+""+istituto
              });
            };                  
          });
        });
      });
    } else {
      var people_service = []
      // servizio
      casper.thenOpen(a.url, function(d,i) {
        
        for(var i = 0; i<4; i++){
          var people_urls = [];
          group_id++;
          unit_name = casper.getElementInfo(x('//div[@class="push_1"]['+(i+1)+']/following::h4[1]')).text.trim().replace(/\n/g, '');
          people = casper.getElementsInfo(x('//div[@class="push_1"]['+(i+1)+']/following::p[1]/a')).forEach(function(d){
            people_urls.push(d.attributes.href)
          })
          
          people_service.push({
            'group_id' : "group"+group_id+""+istituto,
            'name' : unit_name,
            'people' : people_urls
          });
          groups.push({
            "id": "group"+group_id+""+istituto,
            "label": unit_name,
            "description": "",
            "type": a.tipo,
            "url": "",
            "webpage": webpage
          });
        }
        
        for(var k=0; k<people_service.length; k++){

          people_service[k]['people'].forEach(function(d){
            
            href = d 
            var person_in_array = false;

            for (var i = 0; i<persons.length; i++) {
              if (persons[i]['url'] == 'http://www.isti.cnr.it'+href) {
                person_in_array = true;
                id_ok = persons[i]['id'];
              }
            }
            
            var groupid = people_service[k]['group_id']

            if (!person_in_array) {
              
              casper.thenOpen('http://www.isti.cnr.it'+d, function() {

                var person_name = casper.getElementInfo('.shallow').text.slice(0,-1);
          
                var email = '';
                if (casper.exists(x("//em[text() = 'email:']/following::td"))){
                  email = casper.getElementInfo(x("//em[text() = 'email:']/following::td")).text;
                  id_person = email
                } else {
                  id_person = person_name.replace(/ /g,".").replace(/'/g,"").toLowerCase() + "_temporary@isti.cnr.it";
                }

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
                  "id": id_person,
                  "label": person_name,
                  "position": position,
                  "email": email,
                  "tel": tel,
                  "photo_url": photo_url,
                  "url": 'http://www.isti.cnr.it'+d
                });
                
                group_person.push({
                  "person_id": id_person,
                  "group_id": groupid
                });
                
                var room_in_array = false;
                for (var i = 0; i<rooms.length; i++) {
                  if (rooms[i]['label'] == room) {
                    room_in_array = true;
                  }
                }
                
                if (!room_in_array) {
                
                  if (room != ''){
                    stanza_id++;
                    rooms.push({
                      "id": stanza_id,
                      "label": room,
                      "floor": floor,
                      "entrance": gateway,
                      "building": building
                    });

                    person_room.push({
                      "person_id": id_person,
                      "room_id": stanza_id
                    });  
                  }
                            
                } else {
                
                  for (var i = 0; i<rooms.length; i++) {
                    if (rooms[i]['label'] == room) {
                      id_stanza_ok = rooms[i]['id'];
                      if (room != ''){

                        person_room.push({
                          "person_id": id_person,
                          "room_id": id_stanza_ok
                        });   
                      }
                    }
                  }  
                }
                                
              });      
            } else {
              group_person.push({
                "person_id": id_ok,
                "group_id": groupid
              });
            }
          })  
        }
      })
    }
  });
});

// OUTPUT JSON results
casper.on('run.complete', function() {
  utils.dump({
    "id": "isti",
    "groups": groups,
    "persons": persons,
    "group_person": group_person,
    "supervisor_group": supervisor_group,
    "rooms": rooms,
    "person_room": person_room
  });
  casper.exit();
});

casper.run();