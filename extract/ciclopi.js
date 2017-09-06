var utils = require('utils');
var casper = require('casper').create({
    //verbose: true,
    //logLevel: 'debug',
    pageSettings: {
      loadImages:  false, // The WebPage instance used by Casper will
      loadPlugins: false, // use these settings
      userAgent: 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.2 Safari/537.36',
      XSSAuditingEnabled: false,
      localToRemoteUrlAccessEnabled: false
    }
});

libere = 0;
disponibili = 0;
inattive = 0;

casper.start('http://www.ciclopi.eu/frmLeStazioni.aspx', function() {
  /*  get people links
  */
  info = casper.getElementInfo('#wcPGoogle_radRotStazioni_i23_label23').text
  if(info.indexOf(' bici libere') > -1) {
    libere = parseInt(info.split(' bici libere')[0]) 
    info = info.replace(' bici libere','')
    info = info.replace(libere,'')
  } else if (info.indexOf(' bici libera') > -1) {
    libere = parseInt(info.split(' bici libera')[0])
    info = info.replace(' bici libera','')
    info = info.replace(libere,'')
  }
  if(info.indexOf(' posti disponibili') > -1) {
    disponibili = parseInt(info.split(' posti disponibili')[0])
    info = info.replace(' posti disponibili','')
    info = info.replace(disponibili,'')
  } else if (info.indexOf(' posto disponibile') > -1) {
    disponibili = parseInt(info.split(' posto disponibile')[0])
    info = info.replace(' posto disponibile','')
    info = info.replace(disponibili,'')
  }
  if(info.indexOf(' non attive') > -1) {
    inattive = parseInt(info.split(' non attive')[0])
    info = info.replace(' non attive','')
  } else if (info.indexOf(' non attiva') > -1) {
    inattive = parseInt(info.split(' non attiva')[0])
    info = info.replace(' non attiva','')
  }
  
  array=[libere,disponibili,inattive];
  utils.dump(array);
  casper.exit();
});

casper.run();