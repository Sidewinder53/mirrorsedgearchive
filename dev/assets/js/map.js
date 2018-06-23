$(document).ready(function() {
  var mymap = L.map('glassMap', {
    maxZoom: 10
  });
  var options = {
    position: 'bottomleft',
    primaryLengthUnit: 'pixels',
    secondaryLengthUnit: null,
    primaryAreaUnit: 'sqmeters',
    secondaryAreaUnit: null,
    activeColor: '#cd2027',
    completedColor: '#cd2027',
    units: {
      pixels: {
        factor: 1, // Required. Factor to apply when converting to this unit. Length in meters or area in sq meters will be multiplied by this factor.
        display: 'pixels', // Required. How to display in results, like.. "300 Meters (0.3 My New Unit)".
        decimals: 0 // Number of decimals to round results when using this unit. `0` is the default value if not specified.
      }
    }
  };
  var imageUrl = '/assets/media/image/map/test2.svg';
  var bounds = [[0, 0], [100, 100]];
  var sol = L.latLng([50, 50]);
  L.marker(sol).addTo(mymap);
  L.imageOverlay(imageUrl, bounds).addTo(mymap);
  mymap.fitBounds(bounds);
  var measureControl = new L.Control.Measure(options);
  measureControl.addTo(mymap);
});
