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

// URLs from which the scraper will start
var seed_urls = [
  {'url': 'http://www.iit.cnr.it/istituto/organizzazione?q=node/389', 'name': 'Algoritmi e matematica computazionale'},
  {'url': 'http://www.iit.cnr.it/istituto/organizzazione?q=node/26820', 'name': 'Tassonomie, thesauri e sistemi di classificazione'},
  {'url': 'http://www.iit.cnr.it/istituto/organizzazione?q=node/388', 'name': 'Sicurezza, Affidabilità e Privacy per l\'Internet del Futuro'},
  {'url': 'http://www.iit.cnr.it/istituto/organizzazione?q=node/386', 'name': 'Ubiquitous Internet'},
  {'url': 'http://www.iit.cnr.it/istituto/organizzazione?q=node/2452', 'name': 'Web Applications for the Future Internet'},
  {'url': 'http://www.iit.cnr.it/istituto/organizzazione?q=node/395', 'name': 'Registro .it'},
  {'url': 'http://www.iit.cnr.it/istituto/organizzazione?q=node/396', 'name': 'Rete telematica CNR Pisa'},
  {'url': 'http://www.iit.cnr.it/istituto/organizzazione?q=node/397', 'name': 'Servizi Internet e Sviluppo Tecnologico'},
  {'url': 'http://www.iit.cnr.it/istituto/organizzazione?q=node/390', 'name': 'Segreteria Amministrativa'},
  {'url': 'http://www.iit.cnr.it/istituto/organizzazione?q=node/391', 'name': 'Segreteria del Personale'},
  {'url': 'http://www.iit.cnr.it/istituto/organizzazione?q=node/393', 'name': 'Segreteria di Direzione'},
  {'url': 'http://www.iit.cnr.it/istituto/organizzazione?q=node/2124', 'name': 'Segreteria Internet Governance'},
  {'url': 'http://www.iit.cnr.it/istituto/organizzazione?q=node/392', 'name': 'Segreteria Scientifica'},
  {'url': 'http://www.iit.cnr.it/istituto/organizzazione?q=node/394', 'name': 'Ufficio Tecnico e Servizi Ausiliari'}
]

var group_id = 0;
var person_id = 0;
var supervisor_id = 0;
var supervisor_href = '';
var stanza_id = 0;
var urls_people = [];
var array_rooms = [];
var research_group_links = [];
var people = [];

// START the scraper
casper.start('http://www.iit.cnr.it/', function() {});

// MAIN scraping process
casper.then(function() {
  
  seed_urls.forEach(function(a) {
    
    // GROUP
    casper.thenOpen(a.url, function(d,i) {
      group_id++;
      
      if (casper.exists('#anteprima'))
        var description = casper.getElementInfo('#anteprima').text.trim().replace(/     /g, ' ');
      else {
        var descriptions = casper.getElementsInfo('.article>*:not(table)');
        var description = "";
        var tipo = "";
        
        descriptions.forEach(function(p,i) {
          if (i < descriptions.length-1 && p.text.indexOf('Tipo') == -1)
            description += p.text.trim().replace(/     /g,' ').replace(/  /g,'');
          else if (p.text.indexOf('Tipo') > -1)
            tipo = p.text.replace("Tipo: ","");
        });
        
        if (tipo == "" && casper.exists(x("//strong[text() = 'Servizio: ']/following::a")))
          tipo = casper.getElementInfo(x("//strong[text() = 'Servizio: ']/following::a")).text;
      }

      groups.push({
        "id": group_id,
        "label": a.name,
        "description": description,
        "type": tipo,
        "url": a.url
      });

      // PERSON
      casper.then(function() {
        casper.getElementsInfo('p.nome').forEach(function(d) {
                    
          if (d.html.indexOf('href') > -1) {
            var href = d.html.split("<a href=\"")[1].split("\"")[0];

            if (casper.exists(x('//div[@class="referente"]/p[@class="nome"]/a[text() = "'+d.text.replace("'","\'")+'"]')))
              supervisor_href = href
         
            var person_in_array = false;

            for (var i = 0; i<urls_people.length; i++) {
              if (urls_people[i]['url'] == href) {
                person_in_array = true;
                id_ok = urls_people[i]['id'];
              }
            }
            
            if (!person_in_array) {
              
              casper.thenOpen('http://www.iit.cnr.it'+href, function() {

                var email = [];
                if (casper.exists(x("//td[contains(@class, 'label') and text() = 'Email:']/following::td")))
                  if (casper.getElementInfo(x("//td[contains(@class, 'label') and text() = 'Email:']/following::td")).text.replace(/\t/g, '').length>1)
                    email.push(casper.getElementInfo(x("//td[contains(@class, 'label') and text() = 'Email:']/following::td")).text);
                
                urls_people.push({"id":email[0],"url":href})
                
                if (supervisor_href == href) {
                  supervisor_group.push({
                    "id_referente": email[0],
                    "id_gruppo": group_id
                  });
                }
                
                var person_name = casper.getElementInfo('.PostHeader').text.trim();

                var tel = [];
                if (casper.exists(x("//td[contains(@class, 'label') and text() = 'Telefono:']/following::td")))
                  if (casper.getElementInfo(x("//td[contains(@class, 'label') and text() = 'Telefono:']/following::td")).text.replace(/\t/g, '').length>1)
                    tel.push(casper.getElementInfo(x("//td[contains(@class, 'label') and text() = 'Telefono:']/following::td")).text.replace(/\t/g, '').trim());

                var cel = [];
                if (casper.exists(x("//td[contains(@class, 'label') and text() = 'Cellulare:']/following::td"))) {
                  if (casper.getElementInfo(x("//td[contains(@class, 'label') and text() = 'Cellulare:']/following::td")).text.replace(/\t/g, '').length>1) {
                    
                    if (casper.getElementInfo(x("//td[contains(@class, 'label') and text() = 'Cellulare:']/following::td")).text.replace(/\t/g, '').length < 100)
                      cel.push(casper.getElementInfo(x("//td[contains(@class, 'label') and text() = 'Cellulare:']/following::td")).text.replace(/\t/g, '').trim());
                  }
                }

                var fax = [];
                if (casper.exists(x("//td[contains(@class, 'label') and text() = 'Fax:']/following::td"))) {
                  if (casper.getElementInfo(x("//td[contains(@class, 'label') and text() = 'Fax:']/following::td")).text.replace(/\t/g, '').length>1)
                    fax.push(casper.getElementInfo(x("//td[contains(@class, 'label') and text() = 'Fax:']/following::td")).text.replace(/\t/g, ''));
                }
                  
                var building = '';
                if (casper.exists(x("//td[contains(@class, 'label') and text() = 'Edificio:']/following::td")))
                  building = casper.getElementInfo(x("//td[contains(@class, 'label') and text() = 'Edificio:']/following::td")).text;
                  
                var floor = '';
                if (casper.exists(x("//td[contains(@class, 'label') and text() = 'Piano:']/following::td")))
                  floor = casper.getElementInfo(x("//td[contains(@class, 'label') and text() = 'Piano:']/following::td")).text;
                
                var room = '';
                if (casper.exists(x("//td[contains(@class, 'label') and text() = 'Stanza:']/following::td")))
                  room = casper.getElementInfo(x("//td[contains(@class, 'label') and text() = 'Stanza:']/following::td")).text;

                var position = '';
                if (casper.exists(x("//td[contains(@class, 'label') and text() = 'Qualifica:']/following::td")))
                  position = casper.getElementInfo(x("//td[contains(@class, 'label') and text() = 'Qualifica:']/following::td")).text.trim();

                var gateway = '';
                if (casper.exists(x("//td[contains(@class, 'label') and text() = 'Ingresso:']/following::td")))
                  gateway = casper.getElementInfo(x("//td[contains(@class, 'label') and text() = 'Ingresso:']/following::td")).text;

                var description = '';
                if (casper.exists('#description-persona p')) {
                  description = ''
                  description_p = casper.getElementsInfo('#description-persona p').map(function(d) {
                    description += d.text.replace(/\n/g, ' ').replace(/"/g, '');
                  });
                }

                var tags = [];
                if (casper.exists('div#tags span.skill_field')) {
                  tags_array_length = casper.getElementsInfo('div#tags span.skill_field');
                  tags_array = casper.getElementsInfo('div#tags span.skill_field').forEach(function(d,i) {
                    tags.push(d.text);
                  })
                }

                var photo_url = '';
                if (casper.exists('#persona-left > img')) {
                  photo_url = 'http://www.iit.cnr.it/' + casper.getElementInfo("#persona-left > img").attributes.src;
                  casper.download(photo_url, '/var/www/images/depictions/'+email[0]+'.jpg');
                }
                
                email_in_array = false; 
                for (var i = 0; i < persons.length; i++) {
                  if (persons[i]['email'][0] == email[0]) {
                    email_in_array = true;
                    id_ok = persons[i]['id'];
                  }
                }

                if (!email_in_array) {
                  persons.push({
                    "id": email[0],
                    "label": person_name,
                    "position": position.trim(),
                    "description": description.trim(),
                    "tags": tags,
                    "email": email,
                    "tel": tel,
                    "cel": cel,
                    "fax": fax,
                    "photo_url": photo_url,
                    "url": ["http://www.iit.cnr.it"+href]
                  });

                  group_person.push({
                    "person_id": email[0],
                    "group_id": group_id
                  });

                  var room_in_array = false;
                  for (var i = 0; i<array_rooms.length; i++) {
                    if (array_rooms[i]['name'] == room) {
                      room_in_array = true;
                    }
                  }
                  
                  if (!room_in_array) {
                    
                    if (room != ''){
                      stanza_id++;
                      array_rooms.push({"id":stanza_id,"name":room});

                      rooms.push({
                        "id": stanza_id,
                        "label": room,
                        "floor": +floor,
                        "entrance": gateway,
                        "building": building
                      });
                    }
                  }
                  
                  for (var i = 0; i<array_rooms.length; i++) {
                    if (array_rooms[i]['name'] == room) {
                      id_stanza_ok = array_rooms[i]['id'];

                      if (room != ''){

                        person_room.push({
                          "person_id": email[0],
                          "room_id": id_stanza_ok
                        });   
                      }
                    }
                  }
                } else {
                  group_person.push({
                    "person_id": id_ok,
                    "group_id": group_id
                  });
                }
              });      
            } else {
              group_person.push({
                "person_id": id_ok,
                "group_id": group_id
              });
            }
          }          
        });
      });
    });
  });
});

// OUTPUT JSON results
casper.on('run.complete', function() {
  utils.dump({
    "id": "iit.cnr.it",
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