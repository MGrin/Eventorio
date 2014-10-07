
app.factory('Events',['$resource','$http',function($resource,$http,Global){'use strict';var event=$resource('/events/:eventId',{eventId:'@_id'},{update:{method:'POST'}});event.getByMonth=function(month,year,cb){$http.get('/events?month='+month+'&year='+year).success(function(res){return cb(null,res);}).error(function(res){return cb(res);});}
return event;}]);