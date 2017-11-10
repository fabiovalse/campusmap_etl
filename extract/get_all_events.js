var webPage = require('webpage');
var utils = require('utils');
var x = require('casper').selectXPath;
var page = webPage.create();
var casper = require('casper').create({
    //verbose: true,
    //logLevel: 'debug',
    pageSettings: {
      loadImages:  true, // The WebPage instance used by Casper will
      loadPlugins: false, // use these settings
      userAgent: 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.2 Safari/537.36',
      XSSAuditingEnabled: false,
      localToRemoteUrlAccessEnabled: false
    }
});

casper.on('error', function(msg, backtrace) {
  
  console.log('Error!!');
  
  casper.exit(1);
})

var links = [];
var aule = ['Auditorium','Aula 27','Aula 28','Aula 29','Aula 30','Aula 40']
var result = {'Auditorium':[],'Aula 27':[],'Aula 28':[],'Aula 29':[],'Aula 30':[],'Aula 40':[]}

var new_array_links = []
var no_duplicate_links = {}

var dateObj = new Date();
var month = dateObj.getUTCMonth() + 1; //months from 1-12
var day = dateObj.getUTCDate();
var year = (dateObj.getUTCFullYear());
var year_to_loop = 2017
var month_to_loop = 11
var indice_link = 0
var final_array = []

casper.start('http://prenota.isti.cnr.it')

function loop(){
  
  if (month_to_loop < 12 && year_to_loop < (year+2)){
    get_event()
    
    month_to_loop++
    casper.run(loop)
  } else if (month_to_loop == 12 && year_to_loop < (year+2)){
    get_event()
    
    month_to_loop = 1
    year_to_loop++
    casper.run(loop)
  } else if (year_to_loop > year && month_to_loop > 0 && indice_link<links.length) {
    
    open('http://prenota.isti.cnr.it'+links[indice_link].link,indice_link);
    indice_link++
  } else {
    for(var k = 0; k<aule.length; k++){
      if (result[aule[k]].length == 0){ 
        throw("Error")
      }
    }
    Object.keys(result).forEach(function (k){
      var events = result[k]
      events.forEach(function(d){
        d.room = k
      })
      final_array = final_array.concat(events)
    })
    utils.dump(final_array)
    casper.exit()
  }    
}


function get_event() {

  casper.thenOpen('http://prenota.isti.cnr.it/index.php?option=com_jevents&task=month.calendar&year='+(year_to_loop)+'&month='+month_to_loop+'&day='+day+'&Itemid=57', function() {
    /*  get all events links
    */
    if(casper.exists('.cal_table tr td a.cal_titlelink')){
      anchors = casper.getElementsInfo('.cal_table tr td a.cal_titlelink');
      anchors.forEach(function(a) {
        
        if (!no_duplicate_links[a.attributes.href.split('&uid=')[1]]){
          links.push({'link':a.attributes.href,'event_id':a.attributes.href.split('&uid=')[1]});
          no_duplicate_links[a.attributes.href.split('&uid=')[1]] = true
          //utils.dump('new link')
        }         
        
      });
     
    }
 
  });
}

function open(link,i) {
  id = link.split('evid=')[1].split('&')[0]
  uid = link.split('uid=')[1]
  casper.thenOpen(link, function() {
    
    if (casper.exists('.headingrow .contentheading'))
      event_name = casper.getElementInfo('.headingrow .contentheading').text.trim()
    else
      event_name = ''

    if (casper.exists(x("//td[@class='ev_detail repeat' and contains(., 'From')]"))) {
      datetime = casper.getElementInfo(x("//td[@class='ev_detail repeat' and contains(., 'From')]")).text;
      from_date = datetime.split('From ')[1].split(' -  ')[0]
      if (datetime.split('From ')[1].split(' -  ')[1]) {
        from_time = datetime.split('From ')[1].split(' -  ')[1].split('To')[0]  
        to_time = datetime.split('To ')[1].split(' - ')[1]
      } else {
        from_time = '00:00'
        to_time = '23:00'
      }
      
      to_date = datetime.split('To ')[1].split(' - ')[0]
      from_day = parseInt(from_date.split(' ')[1])
      if(from_day.length == 1){
        from_day = '0'+from_day
      }
      from_month = parseInt(getMonthDays(from_date.split(' ')[2]))-1
      if(from_month.length == 1){
        from_month = '0'+from_month
      }
      from_year = parseInt(from_date.split(' ')[3])

      to_day = parseInt(to_date.split(' ')[1])
      if(to_day.length == 1){
        to_day = '0'+to_day
      }
      to_month = parseInt(getMonthDays(to_date.split(' ')[2]))-1
      if(to_month.length == 1){
        to_month = '0'+to_month
      }
      to_year = parseInt(to_date.split(' ')[3])

      Date.prototype.days=function(to){
        return  Math.abs(Math.floor( to.getTime() / (3600*24*1000)) -  Math.floor( this.getTime() / (3600*24*1000)))
      }
      
      Date.prototype.addDays = function(days) {
        this.setDate(this.getDate() + parseInt(days));
        return this;
      };
    
      date_ok = new Date(from_year,from_month,from_day)
      next_first_day =new Date(date_ok.setDate(date_ok.getDate() + 3))
      
      var days = new Date(''+from_year+'/'+from_month+'/'+from_day+'').days(new Date(''+to_year+'/'+to_month+'/'+to_day+''))
      if (parseInt(to_month)-parseInt(from_month)!=0) {

        switch(parseInt(from_month)){
          case 1:
            days -=3
            break;
          case 3:
            days -=1
            break;
          case 5:
            days -=1
            break;
          case 8:
            days -=1
            break;
          case 10:
            days -=1
            break;

        }
      } 

      for (var i = 0; i<days+1;i++){
        var newDate = new Date(from_year,from_month,from_day).addDays(i+1)
        
        date = newDate.toISOString().split('T')[0]
        
        //formato iso YYYY-MM-DDTHH:mm:ss.sssZ

        _start = date+'T'+from_time+':00.000Z'
        _end = date+'T'+to_time+':00.000Z'

        for(var y = 0; y<aule.length; y++){
          if (casper.exists(x("//td[@class='ev_detail' and contains(., '" + aule[y] + "')]"))) {
            result[aule[y]].push({'link':link.split('&Itemid')[0],'day':date, 'label':event_name,'from':from_time,'to':to_time,'_start':_start,'_end':_end,'id':parseInt(id),'uid':uid})
          }  
        }
        
      }
      return;
    } else if(casper.exists(x("//td[@class='ev_detail repeat']"))) {
      datetime = casper.getElementInfo(x("//td[@class='ev_detail repeat']")).text;
      from_date = datetime.split(', ')[0]
      
      pieces = from_date.split(' ')
      from_time = datetime.split(', ')[1].split(' - ')[0]
      to_date = datetime.split(', ')[0]
      to_time = datetime.split(', ')[1].split(' - ')[1]
    } else {
      from_date  = '';
      from_time  = '';
      to_date  = '';
      to_time  = '';
    }

    year_ok = pieces[3]
    month = (months.indexOf(pieces[2])+1)
    if(month.toString().length == 1){
      month = '0'+month
    }
    day = pieces[1]
    if(day.toString().length == 1){
      day = '0'+day
    }
    _start = year_ok+'-'+month+'-'+day+'T'+from_time+':00.000Z'
    _end = year_ok+'-'+month+'-'+day+'T'+to_time+':00.000Z'
    for(var y = 0; y<aule.length; y++){
      if (casper.exists(x("//td[@class='ev_detail' and contains(., '" + aule[y] + "')]"))) {
        result[aule[y]].push({'link':link.split('&Itemid')[0], 'day':year_ok+'-'+month+'-'+day, 'label':event_name,'from':from_time,'to':to_time,'_start':_start,'_end':_end,'id':parseInt(id),'uid':uid})
      }
    }
  });
  casper.run(loop)
}

function getMonthDays(MonthYear) {
  
  var Value=MonthYear      
  var month = (months.indexOf(Value) + 1);      
  return month;
}

var months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

var weekday = new Array(7);
weekday[0]=  "Sunday";
weekday[1] = "Monday";
weekday[2] = "Tuesday";
weekday[3] = "Wednesday";
weekday[4] = "Thursday";
weekday[5] = "Friday";
weekday[6] = "Saturday";

casper.run(loop);