app.directive('googleLocationSearch', [function () {
  return {
    template: '<form class="form-horizontal">' +
                '<div class="col-lg-10 col-lg-offset-1">' +
                  '<div class="form-group">' +
                    '<input id="venue-input" class="form-control" type="text" id="venue-search-input" placeholder="Search for a venue">' +
                  '</div>' +
                '</div>' +
              '</form>' +
              '<div id="address" class="alert alert-info">{{event.venue.formatted_address}}</div>' +
              '<div id="map-canvas"></div>' +
              '<div id="location-discovery-progress" class="text-center">' +
                '<p style="color: grey"> Looking for your location</p>' +
                '<div class="progress"><div class="progress-bar progress-bar-material-light-green"></div></div>' +
              '</div>',
    link: function ($scope, element, attrs) {
      var defaultLat = attrs.lat || '46.518415';
      var defaultLng = attrs.lng || '6.563989';

      var defaultPosition = new google.maps.LatLng(Number(defaultLat), Number(defaultLng));

      var map;
      var placesService;
      var marker;
      var locationMarker;

      var mapCanvas = element.find('#map-canvas');
      var input = element.find('#venue-input');
      var locationDiscovery = element.find('#location-discovery-progress');
      var progressBar = locationDiscovery.find('.progress');

      var init = function (next) {
        var mapOptions = {
          zoom: 15,
        };
        map = new google.maps.Map(mapCanvas[0], mapOptions);
        map.setCenter(defaultPosition);
        locationMarker = new google.maps.Marker({
          map: map,
          position: defaultPosition,
          icon: app.config.google.currentLocationMarker
        });

        placesService = new google.maps.places.PlacesService(map);
        return next();
      };

      var getVenue = function (next) {
        if (!$scope.event.venue.id) return next();
        var place = placesService.getDetails({
          reference: $scope.event.venue.reference,
          placeId: $scope.event.venue.place_id
        }, function (place) {
          fillTheModel(place);
          return next();
        });
      };

      var geolocate = function () {
        if ($scope.event.venue.geometry) return showVenue($scope.event.venue);
        if (!navigator.geolocation) return false;

        loadingLocation(true);
        locationMarker.setVisible(false);
        navigator.geolocation.getCurrentPosition(function (position) {
          var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          locationMarker.setPosition(pos);
          locationMarker.setVisible(true);
          loadingLocation(false);
          if (!marker) map.setCenter(pos);
        });
      };

      var showVenue = function (placeToShow) {
        if (!placeToShow.geometry) return;

        if (placeToShow.geometry.viewport) {
          map.fitBounds(placeToShow.geometry.viewport);
        } else {
          map.setCenter(placeToShow.geometry.location);
        }
        if (!marker) {
          marker = new google.maps.Marker({
            map: map,
            visible: false
          });
        }
        marker.setIcon({
          url: placeToShow.icon,
          size: new google.maps.Size(71, 71),
          scaledSize: new google.maps.Size(35, 35),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34)
        });
        marker.setPosition(placeToShow.geometry.location);
        marker.setVisible(true);
      };

      var addAutocomplete = function () {
        var autocomplete = new google.maps.places.Autocomplete(input[0]);
        autocomplete.bindTo('bounds', map);
        google.maps.event.addListener(autocomplete, 'place_changed', function () {
          if (!marker) {
            marker = new google.maps.Marker({
              map: map,
              visible: false
            });
          }
          marker.setVisible(false);
          var place = autocomplete.getPlace();
          var placeToShow = fillTheModel(place);

          showVenue(placeToShow);
        });
      };

      var fillTheModel = function (place) {
        $scope.event.venue = {
          geometry: place.geometry,
          icon: place.icon,
          website: place.website,
          id: place.id,
          place_id: place.place_id,
          types: place.types,
          name: place.name,
          reference: place.reference,
          formatted_address: place.formatted_address
        };
        $scope.$apply();
        return $scope.event.venue;
      };

      async.series([
        init,
        getVenue
      ], function () {
      });
      $scope.$watch('editmode', function (newVal) {
        if (newVal) {
          addAutocomplete();
          element.find('form').each(function () {
            $(this).removeClass('hide');
          });
          element.find('#address').addClass('hide');
        } else {
          element.find('form').each(function () {
            $(this).addClass('hide');
          });
          element.find('#address').removeClass('hide');
          loadingLocation(false);
        }
      });

      $('#event-location-modal').on('shown.bs.modal', function () {
        google.maps.event.trigger(map, 'resize');
        geolocate();
      });

      var locationIsLoading = false;
      var progress = 0;
      var direction = -1;
      var delta = 10;

      var loadingLocation = function (state) {
        locationIsLoading = state;
        if (!locationIsLoading) return locationDiscovery.addClass('hide');

        locationDiscovery.removeClass('hide');
        var updateProgress = function () {
          progressBar.css('width', progress + '%');
          if (progress === 100 || progress === 0) direction *= -1;
          progress += direction * delta;

          if (locationIsLoading) setTimeout(updateProgress, 50);
        }
        updateProgress();
      }
    }
  };
}]);