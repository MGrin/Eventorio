app.directive('locationAutocomplete', function () {
  return {
    require: 'ngModel',
    template: '<form class="form">' +
                '<div class="form-group" ng-if="mode!==\'Normal\'"><input class="form-control" id="pac-input" type="text" placeholder="Event location"></div>' +
                '<div class="form-group" id="map-canvas"></div>' +
              '</form>',
    link: function ($scope, element, attrs, model) {
      $scope.$watch('mode', function (newMode) {
        var initLocation = new google.maps.LatLng(46.519056,6.566758);
        if (model.location) initLocation = new google.maps.LatLng(model.location.geometry.location.k, model.location.geometry.location.D);
        var mapOptions = {
          center: initLocation,
          zoom: 15
        };

        var map = new google.maps.Map($(element).find('#map-canvas')[0], mapOptions);

        if (newMode !== 'Normal') {
          var input = /** @type {HTMLInputElement} */ $(element).find('#pac-input')[0];
          var autocomplete = new google.maps.places.Autocomplete(input);
          autocomplete.bindTo('bounds', map);

          var infowindow = new google.maps.InfoWindow();
          var marker = new google.maps.Marker({
            map: map,
            anchorPoint: new google.maps.Point(0, -29)
          });

          google.maps.event.addListener(autocomplete, 'place_changed', function() {
            infowindow.close();
            marker.setVisible(false);
            var place = autocomplete.getPlace();
            if (!place.geometry) {
              return;
            }

            // If the place has a geometry, then present it on a map.
            if (place.geometry.viewport) {
              map.fitBounds(place.geometry.viewport);
            } else {
              map.setCenter(place.geometry.location);
              map.setZoom(17);  // Why 17? Because it looks good.
            }
            marker.setIcon(/** @type {google.maps.Icon} */({
              url: place.icon,
              size: new google.maps.Size(71, 71),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(17, 34),
              scaledSize: new google.maps.Size(35, 35)
            }));
            marker.setPosition(place.geometry.location);
            marker.setVisible(true);

            model.$setViewValue(place);
            infowindow.setContent('<div><strong>' + place.name + '</strong><br>');
            infowindow.open(map, marker);
          });
        }

        $('#locationPicker').on('shown.bs.modal', function (e) {
          google.maps.event.trigger(map, "resize");
        });
      });
    }
  };
});