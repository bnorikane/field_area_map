/********************    bcdp_field_map.js     
 - Bruce Norikane
 - August 13, 2023
 
 supersite_map.js creates a Leaflet web map

 Features:
 - Boulder County election districts
    - County, CD, SD, HD, precincts
 - Boulder County Democratic Party Field Team defined Areas 
 - Caucus Supersites
    - Candidate sites and committed sites
  - tooltip with ss_info
  - ss marker shows selected status
 - attribution control
 - BCDP logo

 To Do
 - fix cursor hover
  - problem: after turning precinct layer off and on, cannot get tooltip for supersite
  - Supersite
  - Precinct
  - Area
  - Base Map
 - add legend
 - add icon for browser tab
 - update pct_data to include ss_name
  - SuperSite_precinct_selection.xlsx: export csv with ss_name column for each precinct
  - supersite_pct.ipynb
 - add ss_imfo to info box
 - display Supersite in precinct info box when precinct is selected
 - add Supersite to precinct tooltip
 - truncate latlng to 5 digits
**************************************************** */

//////////////   CREATE MAP OBJECT   //////////////
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

/////////////////    ADD BASEMAP LAYER TO MAP   //////////
const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; BCDP &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

////////////////     ADD precincts GEOJSON LAYER TO MAP

// pct_data.js explicitly defines the pct geojson object
const pctLayer = L.geoJSON(pct_data, {
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

////////////////////   ADD BCDP Field Areas Layer   /////////////////////////////

// function getAreaColor(area) {
//   areaColor = {
//     "BO-01": "red",
//     "BO-02": "green",
//     "BO-03": "blue",
//     "BO-04": "yellow",
//     "BO-05": "magenta",
//     "BO-06": "cyan",
//     "BO-07": "orange",
//     "BO-08": "purple",
//     "BO-09": "pink",
//     "BO-10": "olive",
//     "BO-11": "maroon",
//     "ER-01": "red",
//     "GN-01": "green",
//     "LF-01": "blue",
//     "LF-02": "yellow",
//     "LM-01": "red",
//     "LM-02": "green",
//     "LM-03": "blue",
//     "LM-04": "cyan",
//     "LM-05": "magenta",
//     "LM-06": "cyan",
//     "LM-07": "orange",
//     "LV-01": "magenta",
//     "LV-02": "cyan",
//     "MT-01": "yellow",
//     "MT-02": "magenta",
//     "MT-03": "yellow",
//     "SU-01": "red",
//   };

//   return areaColor[area];
// }

function areaStyle(feature) {
  return {
    fill: false,
    weight: 6,
    opacity: 0.7,
    // color: getAreaColor(feature.properties.Area_Short),
    color: "black",
    fillOpacity: 0.2,
  };
}

// Create areaLayer by reading area data in geojson file
//    Do not automatically display areaLayer
//    User can interactively display Areas using LayerControl
const areaLayer = L.geoJSON(areas_data, {
  style: areaStyle,
});

areaLayer.addTo(map);

////////////////////     ADD Supersite layer to map   //////////////////////
// Create Supersite layer by reading ss_info.geojson file

const supersiteLayer = L.geoJSON(ss_data, {
  pointToLayer: returnSSMarker,
  // style: ssStyle,
})
  .bindTooltip(function (layer) {
    return layer.feature.properties.Venue;
  })
  .addTo(map);

// set all Supersites to single style
// function ssStyle(feature) {
//   return {
//     fill: true,
//     fillOpacity: 0.0,
//     fillColor: "blue",
//     color: "purple",
//     weight: 2,
//     opacity: 1,
//   };
// }

function returnSSMarker(json, latlng) {
  var att = json.properties;
  if (att.Selected == "Yes") {
    var ss_color = "purple";
  } else {
    var ss_color = "grey";
  }
  return L.circleMarker(latlng, { radius: 10, color: ss_color });
}

////////////////////     ADD UI CONTROLS   /////////////////////

// Layers Control

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

// Legend Control

const legend = L.control({ position: "topleft" });

legend.onAdd = function (map) {
  const lg_div = L.DomUtil.create("div", "info legend");
  // var grades = [0, 10, 20, 50, 100, 200, 500, 1000];
  // var labels = [];
  // var from, to;

  // //generate a label with colored square for each density grade
  // for (var i = 0; i < grades.length; i++) {
  //   div.innerHTML +=
  //     '<i style="background:' +
  //     getColor(grades[i] + 1) +
  //     '"></i> ' +
  //     grades[i] +
  //     (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
  // }
  lg_div.innerHTML = "<h4>Legend</h4>";
  lg_div.innerHTML += '<i style="background: red"></i>';

  return lg_div;
};

legend.addTo(map);

/*     ///////////////////////////   code from Udemy Leaflet course   ///////////////////

// truncate latlng to 5 digits
function LatLngToArrayString(ll) {
  // console.log(ll);
  return "["+ll.lat.toFixed(5)+", "+ll.lng.toFixed(5)+"]";
};

*/ ////////////////////////////////////////////////////////////////////////////////////////
