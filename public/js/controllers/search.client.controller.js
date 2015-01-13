app.controller('SearchController', ['$scope', '$compile',
    function ($scope, $compile) {
    var users = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('username'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
            url: '/users?q=%QUERY',
            filter: function(users){
                return users.map(function(user) {
                    user.link = "/users/" + user.username;
                    return user;
                })
            }
        }
    });

    var events = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
            url: '/events?q=%QUERY',
            filter: function(events){
                return events.map(function(event) {
                    event.link = "/events/" + event.id;
                    return event;
                })
            }
        }
    });

    users.initialize();
    events.initialize();

    $scope.searchOptions = {
        highlight: true
    };


   $scope.searchDatasets = [{
      displayKey: 'username',
      source: users.ttAdapter(),
      templates: {
        suggestion: function(user){
          return $compile('<div class="search-item" search-item href="' + user.link + '" picture="' + user.picture + '" title="' + user.username + '" name="' + (user.name || 'No name') + '"></div>')($scope);
        }
      }
    }, {
      displayKey: 'name',
      source: events.ttAdapter(),
      templates: {
        suggestion: function(event){
          return $compile('<div class="search-item" search-item href="' + event.link + '" picture="' + (event.picture || '/img/event_logo.jpg') + '" title="' + event.name + '" name="' + event.organizator.username + '"></div>')($scope);
        }
      }
    }];

    $scope.searchEntry = null;

   /* Dirty fix to handle enter validation on selected input */
   $('.sfTypeahead').on('typeahead:selected', function (e, datum) {
       window.location.href = datum.link;
   });

}]);