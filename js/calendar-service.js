(function(annyang) {
    'use strict';

    function CalendarService($window, $http, $q) {
      var service = {};

      service.events = [];

      service.renderAppointments = function() {
        return loadFile(PERSONAL_CALENDAR);
      }

      var loadFile = function(urls){
        var promises =  [];
        var deferred = $q.defer();

        var promises = [];
        angular.forEach(urls , function(url) {

            var promise = $http({
                url   : url,
                method: 'get'
            });

            promises.push(promise);
        });

        return $q.all(promises).then(function(data) {
          for (var i = 0; i < promises.length; i++) {
            parseICAL(data[i].data);
          }
        });
    	}

      var makeDate = function(ical_date){
    		//break date apart
                    var dtutc =  {
    			year: ical_date.substr(0,4),
    			month: ical_date.substr(4,2),
    			day: ical_date.substr(6,2),
    			hour: ical_date.substr(9,2),
    			minute: ical_date.substr(11,2)
    		}
    		//Create JS date (months start at 0 in JS - don't ask)
                    var utcdatems = Date.UTC(dtutc.year, (dtutc.month-1), dtutc.day, dtutc.hour, dtutc.minute);
                    var dt = {};
                    dt.date = new Date(utcdatems);

                    dt.year = dt.date.getFullYear();
                    dt.month = ('0' + (dt.date.getMonth()+1)).slice(-2);
                    dt.day = ('0' + dt.date.getDate()).slice(-2);
                    dt.hour = ('0' + dt.date.getHours()).slice(-2);
                    dt.minute = ('0' + dt.date.getMinutes()).slice(-2);

    		//Get the full name of the given day
    		dt.dayname =["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dt.date.getDay()];
                    dt.monthname = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ][dt.date.getMonth()] ;

    		return dt;
    	}

      var parseICAL = function(data){
    		//Ensure cal is empty
    		var events = [];

    		//Clean string and split the file so we can handle it (line by line)
    		var cal_array = data.replace(new RegExp( "\\r", "g" ), "").replace(/\n /g,"").split("\n");

    		//Keep track of when we are activly parsing an event
    		var in_event = false;
    		//Use as a holder for the current event being proccessed.
    		var cur_event = null;
    		for(var i=0;i<cal_array.length;i++){
    			var ln = cal_array[i];
    			//If we encounted a new Event, create a blank event object + set in event options.
    			if(!in_event && ln == 'BEGIN:VEVENT'){
    				var in_event = true;
    				var cur_event = {};
    			}
    			//If we encounter end event, complete the object and add it to our events array then clear it for reuse.
                            if(in_event && ln == 'END:VEVENT'){
    				in_event = false;
    				events.push(cur_event);
    				cur_event = null;
    			}
    			//If we are in an event
                            else if(in_event){
                                    //var lntrim = ln.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
                                    //var lnsplit = lntrim.split(':');
                                    //type = lnsplit[0];
                                    //val = lnsplit[1];

    				//Split the item based on the first ":"
    				var idx = ln.indexOf(':');
    				//Apply trimming to values to reduce risks of badly formatted ical files.
    				var type = ln.substr(0,idx).replace(/^\s\s*/, '').replace(/\s\s*$/, '');//Trim
    				var val = ln.substr(idx+1).replace(/^\s\s*/, '').replace(/\s\s*$/, '');

    				//If the type is a start date, proccess it and store details
    				if(type =='DTSTART'){
    					dt = makeDate(val);
    					val = dt.date;
    					//These are helpful for display
    					cur_event.start_time = dt.hour+':'+dt.minute;
    					cur_event.start_date = dt.day+'/'+dt.month+'/'+dt.year;
    					cur_event.day = dt.dayname;
                                            cur_event.start_date_long = dt.day+'. '+dt.monthname+' '+dt.year ;
    				}
    				//If the type is an end date, do the same as above
                                    else if(type =='DTEND'){
    					var dt = makeDate(val);
    					var val = dt.date;
    					//These are helpful for display
    					cur_event.end_time = dt.hour+':'+dt.minute;
    					cur_event.end_date = dt.day+'/'+dt.month+'/'+dt.year;
    					cur_event.day = dt.dayname;
    				}
    				//Convert timestamp
                                    else if(type =='DTSTAMP'){
                                            val = makeDate(val).date;
                                    }
                                    else {
                                        val = val
                                            .replace(/\\r\\n/g,'<br />')
                                            .replace(/\\n/g,'<br />')
                                            .replace(/\\,/g,',');
                                    }

    				//Add the value to our event object.
    				cur_event[type] = val;
    			}
    		}
    		//Run this to finish proccessing our Events.
    		complete(events);
        return service.events = service.events.concat(events);
    	}

      var complete = function(events){
    		//Sort the data so its in date order.
    		events.sort(function(a,b){
    			return a.DTSTART-b.DTSTART;
    		});
    	}

      service.getEvents = function(events){
    		return service.events;
    	}

      service.getFutureEvents = function(){
    		var future_events = [], current_date = new Date();

    		service.events.forEach(function(itm){
    			//If the event ends after the current time, add it to the array to return.
    			if(isDayInFuture(itm)) future_events.push(itm);
    		});
        future_events = sortAscending(future_events);
    		return future_events.slice(0, 9);
    	}

      var sortAscending = function(events) {
        return events.sort(function (a, b) {
            var key1 = getEndValue(a);
            var key2 = getEndValue(b);

            if (key1.isBefore(key2)) {
                return -1;
            } else if (key1.isSame(key2)) {
                return 0;
            } else {
                return 1;
            }
        });
      }

      service.getPastEvents = function(events){
    		var past_events = [], current_date = new Date();

    		service.events.forEach(function(itm){
    			//If the event ended before the current time, add it to the array to return.
    			if(itm.DTEND <= current_date) past_events.push(itm);
    		});
    		return past_events.reverse();
    	}

      var isDayInFuture = function(itm) {
        var momentDate = getEndValue(itm);
        var today = moment();
        if (momentDate !== null) {
          return momentDate.isAfter(today);
        } else {
          return false;
        }
      }

      var getEndValue = function(itm) {
        var momentDate = null;
        if (itm.hasOwnProperty('DTEND')) {
          var value = itm['DTEND'];
          var momentDate = moment(value);
        } else if (itm.hasOwnProperty('DTEND;VALUE=DATE')) {
          var value = itm['DTEND;VALUE=DATE'];
          var format = 'YYYYMMDD';
          var momentDate = moment(value, format);
        }
        return momentDate;
      }

      var load = function(ical_file){
    		var tmp_this = this;
    		this.raw_data = null;
    		this.loadFile(ical_file, function(data){
    			//if the file loads, store the data and invoke the parser
    			tmp_this.raw_data = data;
    			tmp_this.parseICAL(data);
    		});
    	}

      return service;
    }

    angular.module('SmartMirror')
        .factory('CalendarService', CalendarService);
}(window.annyang));
