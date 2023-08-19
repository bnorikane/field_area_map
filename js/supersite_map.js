/********************    
 
<<<<<<<<<<<<<<<<<    bcdp_field_map.js     >>>>>>>>>>>>>>>>>>>>>>>>>>

 - Bruce Norikane
 - August 13, 2023
 
 supersite_map.js creates a Leaflet web map that shows Boulder Caucus Supersites

 Features:
 - Boulder County election districts
  - 2023 precincts
  - County
 - Boulder County Democratic Party Field Team defined 
  - Areas 
 - Caucus Supersites
    - selected sites
    - unselected backup sites
  - tooltip with ss_info
  - ss marker shows selected status
 - attribution control
 - BCDP logo
 - legend

 <<<<<<<<<<<<<<<<<< ISSUES
 
 ERROR - Area boundaries not shown on map
 Uncaught TypeError: Cannot set properties of null (setting 'innerHTML')
    at displayPctInfo (supersite_map.js:160:50)

 line 160:
  document.getElementById("mountains").innerHTML =
    e.target.feature.properties.mail;


 <<<<<<<<<<<<<<<<<<    TO DO   >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

 - Refactor supersite update process to automate updates
  - 1 Refactor geojson file reads to AJAX instead of JSON embedded in .js files. e.g. areas_data.js
  - 2 refactor input files into GeoPackage file (SQLite)  
        and read data using Leaflet GeoPackage plugin
 - fix cursor hover
  - problem: after turning precinct layer off and on, cannot get tooltip for supersite
  - need to improve event bubbling between layers
 - minor - improve legend graphics
 - minor debug icon for browser tab on Github page
 - update pct_data to include ss_name
  - SuperSite_precinct_selection.xlsx: export csv with ss_name column for each precinct
  - supersite_pct.ipynb
 - add ss_imfo to info box
 - display Supersite in precinct info box when precinct is selected
 - add Supersite to precinct tooltip
 - truncate latlng to 5 digits

*********************************************************************** */

//////////////////////////////////////////////////////////////////
////////        CREATE MAP OBJECT        ///////////////////
//////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////
////////        ADD MAP LAYERS                 ////////////////////
////////////////////////////////////////////////////////////////////

////////////////        BASEMAP LAYER             ////////////////////

const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; BCDP &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

////////////////        PRECINCTS LAYER       ///////////////////

// pct_data.js
const pctLayer = new L.GeoJSON.AJAX("data/pct_area_boulder.geojson", {
  style: pctStyle,
  onEachFeature: onEachFeature,
});
pctLayer.addTo(map);

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

function onEachFeature(feature, layer) {
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
  document.getElementById("mountains").innerHTML =
    e.target.feature.properties.mail;
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

// Read Area data from geojson file and create Leaflet GeoJSON layer and add to map
const areaLayer = new L.GeoJSON.AJAX("data/areas.geojson", {
  style: areaStyle,
}).addTo(map);

////////////////        SUPERSITE LAYER        //////////////////////

// Create Supersite layer by reading ss_info.geojson file
const supersiteLayer = new L.GeoJSON.AJAX("data/ss_info.geojson", {
  pointToLayer: returnSSMarker,
  // style: ssStyle,
});

supersiteLayer
  .bindTooltip(function (layer) {
    return layer.feature.properties.Venue;
  })
  .addTo(map);

function returnSSMarker(json, latlng) {
  var att = json.properties;
  if (att.Selected == "Yes") {
    var ss_color = "purple";
  } else {
    var ss_color = "grey";
  }
  return L.circleMarker(latlng, { radius: 10, color: ss_color });
}

////////////////        BOULDER COUNTY LAYER   ////////////////////

function countyStyle(feature) {
  return {
    color: "black",
    weight: 7,
    fillOpacity: 0.0,
  };
}
const countyLayer = new L.GeoJSON.AJAX("data/County_Boundary.geojson", {
  style: countyStyle,
});

////////////////////////////////////////////////////////////////////
////////        ADD UI CONTROLS                /////////////////////
////////////////////////////////////////////////////////////////////

////////////////        LAYERS CONTROL           ///////////////////

const baseMaps = {
  OpenStreetMaps: osm,
};

const overlayMaps = {
  Precinct: pctLayer,
  "BCDP Field Areas": areaLayer,
  Supersites: supersiteLayer,
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
    '<i style="background: purple; border-radius: 20px"></i><span>Supersite 2024</span></br>';
  lg_div.innerHTML +=
    '<i style="background: grey; border-radius: 20px"></i><span>Site Candidate</span></br>';
  lg_div.innerHTML +=
    '<i style="background: black; height: 5px"></i><span>Area</span></br>';
  lg_div.innerHTML +=
    '<i style="background: red; height: 2px"></i><span>Precinct</span></br>';

  return lg_div;
};

legend.addTo(map);

/*     //////////////    code from Udemy Leaflet course    //////////

// truncate latlng to 5 digits
function LatLngToArrayString(ll) {
  // console.log(ll);
  return "["+ll.lat.toFixed(5)+", "+ll.lng.toFixed(5)+"]";
};

*/ //////////////////////////////////////////////////////////////////
