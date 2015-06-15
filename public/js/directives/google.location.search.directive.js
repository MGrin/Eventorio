'use strict';

app.directive('googleLocationSearch', [function () { // jshint ignore:line
  return {
    templateUrl: '/view/google.location.search.template.html',
    link: function ($scope, element, attrs) {
      if (typeof google === 'undefined') { // jshint ignore:line
        console.log('Google maps library is not loaded');
        return;
      }
      var defaultLat = attrs.lat || '46.518415';
      var defaultLng = attrs.lng || '6.563989';

      var defaultPosition = new google.maps.LatLng(Number(defaultLat), Number(defaultLng)); // jshint ignore:line

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
        map = new google.maps.Map(mapCanvas[0], mapOptions);// jshint ignore:line
        map.setCenter(defaultPosition);
        locationMarker = new google.maps.Marker({// jshint ignore:line
          map: map,
          position: defaultPosition,
          icon: app.config.google.currentLocationMarker// jshint ignore:line
        });

        placesService = new google.maps.places.PlacesService(map);// jshint ignore:line
        return next();
      };

      var getVenue = function (next) {
        if (!$scope.event.venue.id) return next();
        var placeObj = {};
        if ($scope.event.venue.place_id) placeObj.placeId = $scope.event.venue.place_id; // jshint ignore:line
        else if ($scope.event.venue.reference) placeObj.reference = $scope.event.venue.reference;

        placesService.getDetails(placeObj, function (place) {
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
          var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);// jshint ignore:line
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
          marker = new google.maps.Marker({// jshint ignore:line
            map: map,
            visible: false
          });
        }
        marker.setIcon({
          url: placeToShow.icon,
          size: new google.maps.Size(71, 71),// jshint ignore:line
          scaledSize: new google.maps.Size(35, 35),// jshint ignore:line
          origin: new google.maps.Point(0, 0),// jshint ignore:line
          anchor: new google.maps.Point(17, 34)// jshint ignore:line
        });
        marker.setPosition(placeToShow.geometry.location);
        marker.setVisible(true);
      };

      var addAutocomplete = function () {
        var autocomplete = new google.maps.places.Autocomplete(input[0]);// jshint ignore:line
        autocomplete.bindTo('bounds', map);
        google.maps.event.addListener(autocomplete, 'place_changed', function () {// jshint ignore:line
          if (!marker) {
            marker = new google.maps.Marker({// jshint ignore:line
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
          place_id: place.place_id,// jshint ignore:line
          types: place.types,
          name: place.name,
          reference: place.reference,
          formatted_address: place.formatted_address// jshint ignore:line
        };
        $scope.$apply();
        return $scope.event.venue;
      };

      async.series([// jshint ignore:line
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
        google.maps.event.trigger(map, 'resize');// jshint ignore:line
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
        };
        updateProgress();
      };
    }
  };
}]);
