
app.factory('Users',['$resource','$http','Global',function($resource,$http,Global){'use strict';var user=$resource('/users/:userId',{userId:'@_id'},{update:{method:'POST'}});user.getCurrentUser=function(){$http.get('/users/me').success(function(response){Global.me=response;}).error(function(response){Global.me=undefined;});}
user.login=function(email,password,cb){$http.post('/login',{username:email,password:password}).success(function(response){return cb();}).error(function(response){return cb(response.data);})}
return user;}]);