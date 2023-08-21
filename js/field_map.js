/********************    
 
<<<<<<<<<<<<<<<<<    field_map.js     >>>>>>>>>>>>>>>>>>>>>>>>>>

 - Bruce Norikane
 - August 21, 2023
 
field_map.js creates a Leaflet web map for the BCDP Field Team

 Features:
 - Boulder County election districts
  - 2023 precincts
  - 2021 districts - County, CD, SD, HD
 - Boulder County Democratic Party Field Team defined 
  - Areas 
- Reads district information and geometry stored in geojson files.
    - geojson files created using field_map_etl.ipynb
- attribution control
- BCDP logo
- legend

 <<<<<<<<<<<<<<<<<< ISSUES

 <<<<<<<<<<<<<<<<<<    TO DO   >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

- refactor geojson layer creation into functions
- refactor input files into GeoPackage file (SQLite)  
- fix cursor hover
  - problem: after turning precinct layer off and on, cannot get tooltip for supersite
  - need to improve event bubbling between layers
- minor - improve legend graphics
- minor debug icon for browser tab on Github page
- truncate latlng to 5 digits

*********************************************************************** 
*/

////////        CREATE MAP OBJECT        ///////////////////

// Set map options
// center map in Boulder County
const boulderLatlng = [40.08, -105.35];
let options = {
  center: boulderLatlng,
  zoom: 11,
  zoomControl: true,
  attribution: "",
};

// Create Map object in #map container
const map = L.map("map", options);

////////        ADD MAP LAYERS                 ////////////////////

////////////////        BASEMAP LAYER             ////////////////////

const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; BCDP &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

////////////////        AREAS LAYER           ///////////////////

const areaLayer = new L.GeoJSON.AJAX("data/areas.geojson", {
  style: areaStyle,
}).addTo(map);

////////////////        PRECINCTS LAYER       ///////////////////

// pct_data.js
const pctLayer = new L.GeoJSON.AJAX("data/pct_area_boulder.geojson", {
  style: pctStyle,
  onEachFeature: onEachPrecinct,
}).addTo(map);

////////        ADD UI CONTROLS                /////////////////////

////////////////        LAYERS CONTROL           ///////////////////

const baseMaps = {
  OpenStreetMaps: osm,
};

const overlayMaps = {
  Precinct: pctLayer,
  "BCDP Field Areas": areaLayer,
};

// Add layerControl
const layerControl = L.control
  .layers(baseMaps, overlayMaps, { position: "topleft", collapsed: false })
  .addTo(map);

////////////////        LEGEND CONTROL           /////////////////////

const legend = L.control({ position: "topleft" });

legend.onAdd = function (map) {
  const lg_div = L.DomUtil.create("div", "info legend");

  // Create html to show legend text
  lg_div.innerHTML = "<h4>Legend</h4>";
  lg_div.innerHTML +=
    '<i style="background: black; height: 5px"></i><span>Area</span></br>';
  lg_div.innerHTML +=
    '<i style="background: red; height: 2px"></i><span>Precinct</span></br>';

  return lg_div;
};

legend.addTo(map);

/////////////////////////////////////////////////////////////////////
////////        FUNCTIONS                            ////////////////
/////////////////////////////////////////////////////////////////////

////////////////        AREAS LAYER     /////////////////////////////

function areaStyle(feature) {
  return {
    fill: false,
    weight: 6,
    opacity: 0.7,
    color: "black",
    fillOpacity: 0.2,
  };
}

////////////////        PRECINCTS LAYER          ////////////////////

// set all precincts to single style
function pctStyle(feature) {
  return {
    fill: true,
    fillOpacity: 0.0, // do not show any fill color
    fillColor: pctFillColor(feature),
    color: "red",
    weight: 1,
    opacity: 1,
  };
}

// Add precinct fill color for Voter Guide Delivery status
function pctFillColor(feature) {
  switch (feature.properties.rural) {
    case "Unknown":
      pct_color = "cyan";
      break;
    case "x":
      pct_color = "yellow";
      break;
    case "NaN":
      pct_color = "blue";
      break;
    default:
      pct_color = "black";
  }
  return pct_color;
}

function onEachPrecinct(feature, layer) {
  // var popupContent =
  //   "<p><b>Precinct: </b>" +
  //   feature.properties.precinct +
  //   "</br>Area: " +
  //   feature.properties.area_short +
  //   "</br>Mail: " +
  //   feature.properties.mountains +
  //   "</p>";

  // layer.bindPopup(popupContent);

  // Add tooltip to each precinct with Precinct and Area
  // const tooltipContent = "<b>" + feature.properties.precinct + "</b>";
  const tooltipContent =
    "<b>PCT: " +
    feature.properties.precinct +
    "<br >Area: " +
    feature.properties.area_short +
    // "<br >Supersite: " +
    // feature.properties.mail +
    "</b>";

  layer.bindTooltip(tooltipContent, {
    offset: [-10, 0],
    opacity: 0.7,
    permanent: false,
    // className: "pct-tooltip",
  });

  // layer.on("mouseover", highlightFeature);
  // layer.on("mouseout", resetHighlight);
  layer.on("click", function (e) {
    pctLayer.setStyle(pctStyle); //resets layer colors
    layer.setStyle(highlight); //highlights selected.
    displayPctInfo(e); // show pct data in info box
  });
}

const highlight = {
  weight: 5,
  color: "#666",
  dashArray: "",
  fillOpacity: 0,
};

function highlightFeature(e) {
  let layer = e.target;
  layer.setStyle(highlight);
  layer.bringToFront();
}

function displayPctInfo(e) {
  document.getElementById("pct_num").innerHTML =
    e.target.feature.properties.precinct;
  document.getElementById("area").innerHTML =
    e.target.feature.properties.area_long;

  // set mail status by mountains property
  // document.getElementById("mountains").innerHTML =
  // e.target.feature.properties.mail;
}

// mouseout event handler
function resetHighlight(e) {
  pctLayer.setStyle(pctStyle);
}

// click event handler
function selectPct(e) {
  map.fitBounds(e.target.getBounds());
  highlightFeature(e);
  displayPctInfo(e);
}
