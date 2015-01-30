app.directive('locationAutocomplete', function () {
  var showLocation = function (location, map, marker) {
    marker.setVisible(false);
    var coords = {lat: location.coordinates.k, lng: location.coordinates.D};
    map.setCenter(coords);
    map.setZoom(13);

    marker.setPosition(coords);
    if (location.icon) {
      marker.setIcon(/** @type {google.maps.Icon} */({
        url: location.icon.url,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(35, 35)
      }));
    }
    marker.setVisible(true);
  };

  return {
    require: 'ngModel',
    template: '<form class="form">' +
                '<div class="form-group" ng-if="mode!==\'Normal\'"><input class="form-control" id="pac-input" type="text" placeholder="Event location"></div>' +
                '<div class="form-group" id="map-canvas"></div>' +
              '</form>',
    link: function ($scope, element, attrs, model) {
      $scope.$watch('mode', function (newMode) {
        var mapOptions;
        if (!model.$modelValue) model.$modelValue = {};

        if (!model.$modelValue.coordinates) {
          mapOptions = {
            center: new google.maps.LatLng(46.519056,6.566758),
            zoom: 13
          };
        } else {
          mapOptions = {
            center: new google.maps.LatLng(model.$modelValue.coordinates.k, model.$modelValue.coordinates.D),
            zoom: 13
          };
        }

        var map = new google.maps.Map($(element).find('#map-canvas')[0], mapOptions);
        var marker = new google.maps.Marker({
          map: map,
          anchorPoint: new google.maps.Point(0, -29)
        });
        var infowindow = new google.maps.InfoWindow();

        if (model.$modelValue.coordinates) showLocation(model.$modelValue, map, marker);

        if (newMode !== 'Normal') {
          var input = /** @type {HTMLInputElement} */ $(element).find('#pac-input')[0];
          var autocomplete = new google.maps.places.Autocomplete(input);
          autocomplete.bindTo('bounds', map);

          google.maps.event.addListener(autocomplete, 'place_changed', function() {
            infowindow.close();
            var place = autocomplete.getPlace();
            if (!place.geometry) {
              return;
            }
            var modelValue = {
              coordinates: place.geometry.location,
              name: place.name,
              address: place.formatted_address,
              icon: {
                url: place.icon,
              }
            };
            model.$setViewValue(modelValue);

            showLocation(model.$modelValue, map, marker);

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