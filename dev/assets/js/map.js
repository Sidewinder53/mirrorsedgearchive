window.app = {};
var app = window.app;

app.MeasureModeControl = function(opt_options) {
  var options = opt_options || {};

  var button = document.createElement('button');
  button.innerHTML = 'M';

  var this_ = this;
  var handleRotateNorth = function() {
    this_
      .getMap()
      .getView()
      .setRotation(0);
  };

  button.addEventListener('click', handleRotateNorth, false);
  button.addEventListener('touchstart', handleRotateNorth, false);

  var element = document.createElement('div');
  element.className = 'measure-mode ol-unselectable ol-control';
  element.appendChild(button);

  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });
};
ol.inherits(app.MeasureModeControl, ol.control.Control);

var raster = new ol.layer.Tile({
  source: new ol.source.OSM()
});

var source = new ol.source.Vector();

var vector = new ol.layer.Vector({
  source: source,
  style: new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 255, 0.2)'
    }),
    stroke: new ol.style.Stroke({
      color: '#ffcc33',
      width: 2
    }),
    image: new ol.style.Circle({
      radius: 7,
      fill: new ol.style.Fill({
        color: '#ffcc33'
      })
    })
  })
});

/**
 * Currently drawn feature.
 * @type {ol.Feature}
 */
var sketch;

/**
 * The help tooltip element.
 * @type {Element}
 */
var helpTooltipElement;

/**
 * Overlay to show the help messages.
 * @type {ol.Overlay}
 */
var helpTooltip;

/**
 * The measure tooltip element.
 * @type {Element}
 */
var measureTooltipElement;

/**
 * Overlay to show the measurement.
 * @type {ol.Overlay}
 */
var measureTooltip;

/**
 * Message to show when the user is drawing a polygon.
 * @type {string}
 */
var continuePolygonMsg = 'Click to continue drawing the polygon';

/**
 * Message to show when the user is drawing a line.
 * @type {string}
 */
var continueLineMsg = 'Click to continue drawing the line';

/**
 * Handle pointer move.
 * @param {ol.MapBrowserEvent} evt The event.
 */
var pointerMoveHandler = function(evt) {
  if (evt.dragging) {
    return;
  }
  /** @type {string} */
  var helpMsg = 'Click to start drawing';

  if (sketch) {
    var geom = sketch.getGeometry();
    if (geom instanceof ol.geom.Polygon) {
      helpMsg = continuePolygonMsg;
    } else if (geom instanceof ol.geom.LineString) {
      helpMsg = continueLineMsg;
    }
  }

  helpTooltipElement.innerHTML = helpMsg;
  helpTooltip.setPosition(evt.coordinate);

  helpTooltipElement.classList.remove('hidden');
};

var imageWidth = 5370;
var imageHeight = 5370;

var imageExtent = [0, 0, imageWidth, imageHeight];
var imageProjection = new ol.proj.Projection({
  code: 'image',
  units: 'pixels',
  extent: imageExtent
});

var markerStyle = new ol.style.Style({
  image: new ol.style.Icon({
    anchor: [0.5, 64],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    src:
      'http://icons.iconarchive.com/icons/paomedia/small-n-flat/64/map-marker-icon.png'
  })
});

var markers = [
  new ol.Feature({
    geometry: new ol.geom.Point([2420, 1870]),
    code: 'Pipole'
  })
];

markers.forEach(function(marker) {
  marker.setStyle(markerStyle);
});

var markersLayer = new ol.layer.Vector({
  source: new ol.source.Vector({
    features: markers
  })
});

var imageLayer = new ol.layer.Image({
  source: new ol.source.ImageStatic({
    url: '/assets/media/image/map/map_1x1.png',
    projection: imageProjection,
    imageExtent: imageExtent
  })
});

var map = new ol.Map({
  controls: ol.control
    .defaults({ rotate: false })
    .extend([new app.MeasureModeControl()]),
  interactions: ol.interaction.defaults({
    altShiftDragRotate: false,
    pinchRotate: false
  }),
  layers: [imageLayer, markersLayer],
  target: 'map',
  view: new ol.View({
    projection: imageProjection,
    center: ol.extent.getCenter(imageExtent),
    zoom: 2,
    maxZoom: 5
  })
});

map.on('pointermove', pointerMoveHandler);

map.getViewport().addEventListener('mouseout', function() {
  helpTooltipElement.classList.add('hidden');
});

var typeSelect = document.getElementById('type');

var draw; // global so we can remove it later

/**
 * Format length output.
 * @param {ol.geom.LineString} line The line.
 * @return {string} The formatted length.
 */
var formatLength = function(line) {
  var length = ol.Sphere.getLength(line);
  var output;
  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
  } else {
    output = Math.round(length * 100) / 100 + ' ' + 'm';
  }
  return output;
};

/**
 * Format area output.
 * @param {ol.geom.Polygon} polygon The polygon.
 * @return {string} Formatted area.
 */
var formatArea = function(polygon) {
  var area = ol.Sphere.getArea(polygon);
  var output;
  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
  } else {
    output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
  }
  return output;
};

function addInteraction() {
  var type = typeSelect.value == 'area' ? 'Polygon' : 'LineString';
  draw = new ol.interaction.Draw({
    source: source,
    type: type,
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.2)'
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(0, 0, 0, 0.5)',
        lineDash: [10, 10],
        width: 2
      }),
      image: new ol.style.Circle({
        radius: 5,
        stroke: new ol.style.Stroke({
          color: 'rgba(0, 0, 0, 0.7)'
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        })
      })
    })
  });
  map.addInteraction(draw);

  createMeasureTooltip();
  createHelpTooltip();

  var listener;
  draw.on(
    'drawstart',
    function(evt) {
      // set sketch
      sketch = evt.feature;

      /** @type {ol.Coordinate|undefined} */
      var tooltipCoord = evt.coordinate;

      listener = sketch.getGeometry().on('change', function(evt) {
        var geom = evt.target;
        var output;
        if (geom instanceof ol.geom.Polygon) {
          output = formatArea(geom);
          tooltipCoord = geom.getInteriorPoint().getCoordinates();
        } else if (geom instanceof ol.geom.LineString) {
          output = formatLength(geom);
          tooltipCoord = geom.getLastCoordinate();
        }
        measureTooltipElement.innerHTML = output;
        measureTooltip.setPosition(tooltipCoord);
      });
    },
    this
  );

  draw.on(
    'drawend',
    function() {
      measureTooltipElement.className = 'tooltip tooltip-static';
      measureTooltip.setOffset([0, -7]);
      // unset sketch
      sketch = null;
      // unset tooltip so that a new one can be created
      measureTooltipElement = null;
      createMeasureTooltip();
      ol.Observable.unByKey(listener);
    },
    this
  );
}

/**
 * Creates a new help tooltip
 */
function createHelpTooltip() {
  if (helpTooltipElement) {
    helpTooltipElement.parentNode.removeChild(helpTooltipElement);
  }
  helpTooltipElement = document.createElement('div');
  helpTooltipElement.className = 'tooltip hidden';
  helpTooltip = new ol.Overlay({
    element: helpTooltipElement,
    offset: [15, 0],
    positioning: 'center-left'
  });
  map.addOverlay(helpTooltip);
}

/**
 * Creates a new measure tooltip
 */
function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  }
  measureTooltipElement = document.createElement('div');
  measureTooltipElement.className = 'tooltip tooltip-measure';
  measureTooltip = new ol.Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center'
  });
  map.addOverlay(measureTooltip);
}

/**
 * Let user change the geometry type.
 */
typeSelect.onchange = function() {
  map.removeInteraction(draw);
  addInteraction();
};

addInteraction();
