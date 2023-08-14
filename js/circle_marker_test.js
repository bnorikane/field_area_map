/********************    bcdp_field_map.js     
  To Do
 - add tooltip with ss_info
 - change ss marker icon to show status
 - add ss_imfo to info box
 - display Supersite in precinct info box when precinct is selected
 - add Supersite to precinct tooltip
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

////////////////////     ADD Supersite layer to map   //////////////////////
// Create Supersite layer by reading ss_info.geojson file

const supersiteLayer = L.geoJSON(ss_data, {
  pointToLayer: returnSSMarker,
  style: ssStyle,
})
  .bindTooltip(function (layer) {
    return layer.feature.properties.Venue;
  })
  .addTo(map);

// set all Supersites to single style
function ssStyle(feature) {
  return {
    fill: true,
    fillOpacity: 0.0,
    fillColor: "blue",
    color: "purple",
    weight: 2,
    opacity: 1,
  };
}

function returnSSMarker(json, latlng) {
  return L.circleMarker(latlng, { radius: 10, color: "red" });
}
