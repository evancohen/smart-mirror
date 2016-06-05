(function(annyang) {
  'use strict';

  function SubwayService($http) {
    var service = {};
    var SATURDAY_CODE = 2;
    var SUNDAY_CODE = 3;
    var OTHERDAY_CODE = 1;
    service.stationrow = null;

    service.init = function(station){
      return $http.get("http://openAPI.seoul.go.kr:8088/"+config.subway.key+"/xml/SearchInfoBySubwayNameService/1/5/"+station+"/").
      then(function(response) {
        var x2js = new X2JS();
        var jsonData = x2js.xml_str2json(response.data);
        if(jsonData.SearchInfoBySubwayNameService.row){
          service.stationrow = jsonData.SearchInfoBySubwayNameService.row;
        }
      });
    };

    var getLinecode = function(linenumber){

      if(linenumber === "신분당"){
        return "S";
      }
      if(linenumber === "분당"){
        return "B";
      }
      if(linenumber === "인천"){
        return "I";
      }
      if(linenumber === "경의 중앙"){
        return "A";
      }
      if(linenumber === "경춘"){
        return "G";
      }
      if(linenumber === "공항"){
        return "K";
      }
      if(linenumber === "의정부"){
        return "U";
      }
      if(linenumber === "수인"){
        return "SU";
      }
      if(linenumber === "에버라인"){
        return "E";
      }
      return linenumber;
    }

    var getUpDownCode = function(updown){
      if(updown === "상행선"){
        return 1;
      }
      return 2;
    }

    var getWeekCode = function() {
      var now = new Date();
      var today = now.getDay();
      //saturday
      if(today === 6){
        return SATURDAY_CODE;
      }
      //sunday
      if(today === 7){
        return SUNDAY_CODE;
      }
      return OTHERDAY_CODE;
    }

    var getStationCode = function(linecode){
      if(typeof service.stationrow.length == 'undefined'){
        return service.stationrow.STATION_CD;
      }
      for(var i = 0; i < service.stationrow.length; i++){
        if(service.stationrow[i].LINE_NUM == linecode){
          var stationcode = service.stationrow[i].STATION_CD;
          return stationcode;
        }
      }
      return null;
    }
    service.getArriveTime = function(linenumber,updown) {
      var updowncode = getUpDownCode(updown);
      var weekcode = getWeekCode();
      var linecode = getLinecode(linenumber);
      var stationcode = getStationCode(linecode);
      console.log(stationcode);
      return $http.get("http://openAPI.seoul.go.kr:8088/"+config.subway.key+"/xml/SearchArrivalInfoByIDService/1/5/"+stationcode+"/"+updowncode+"/"+weekcode+"/").
      then(function(response) {
        var x2js = new X2JS();
        var jsonData = x2js.xml_str2json(response.data);
        console.log(jsonData)
        if("SearchArrivalInfoByIDService" in jsonData && "row" in jsonData.SearchArrivalInfoByIDService){
          var result = jsonData.SearchArrivalInfoByIDService.row
          return result;
        }
        return null;
      });
    };

    return service;
  }

  angular.module('SmartMirror')
  .factory('SubwayService', SubwayService);

}(window.annyang));
