# Leaflet Map showing Boulder County Dems Field Districts

## July 2023 - moved ongoing Field Map work to field_area_map folder

This Leaflet map reads geojson file with district boundaries and displays them in an interactive web map

- Boulder County 2022 election districts
- BCDP 2022 Field Team Areas
- 2022 districts created by 2021 Redistricting Commission after 2020 Census
- Started: August 24, 2022
- Updated:

## ISSUES

- Cannot use ThunderForest Mobile basemap
  - simpler and higher contrast basemap
  - seems to conceal overlays

### SOLVED ISSUES

- leaflet-ajax and leaflet-provider plugins are incompatible

  - leaflet-ajax would only work when I removed the leaflet-provider plugin
  - had to use the built in tileLayer constructor

- SD geojson files use urn:ogc:def:crs:EPSG::2232, not compatible with Leaflet display
  - need to convert these files
  - Leaflet's default projection is EPSG:3857, also known as "Google Mercator" or "Web Mercator" and sometimes designated with the number "900913". This projection is what most slippy tile based maps use, including the common tile sets from Google, Bing, OpenStreetMap, and others. You can easily use this projection in QGIS by selecting "Google Mercator EPSG:900913". Leaflet has some basic support for displaying maps in other projections. Most folks who do that seem to use the addon Proj4Leaflet to perform the projection.

## Project files

- Project folder: field_map_leaflet
  - C:\Users\Bruce Norikane\bcdp\field_map_leaflet
- main file: field_map.html
  - C:\Users\Bruce Norikane\bcdp\field_map_leaflet\field_map.html

## BCDP Field Map Data

All the GeoJSON data files were transformed for this app by the BCDP Field Map project

- Jupyter notebook ETL'd various input data and created the GeoJSON files
- Updated: August 24, 2022

## Minimum Viable Product

Interactive Leaflet map

- Layer control to show/hide layers

- Basemap

  - Thunder Forest Mobile

- Overlay Layers
  - Election Districts for Boulder County
    - Boulder County
    - Boulder County Precincts
    - Congressional District
    - Colorado State Senate Districts
    - Colorado State House Districts
  - BCDP Field Organization
    - Field Team Areas

## Potential Enhancements

- Field Team Coverage and Vacancies
  - Orphan Areas
  - Orphan Precincts
  - Single Precinct Organizer Vacancy
  - BCDP Field Team Member Data
    - AC Names
    - PCP Names
  - BCDP Caucus SuperSite Boundaries (list of precincts)
- Satellite tile layer

## Input Files

- Boulder County boundary
  - CD Boundary
  - SD Boundaries
  - HD Boundaries
  - Boulder County Precincts
  - BCDP Field Team Areas (list of precincts in each Area)

## Output Files

- Leaflet project folder
  - bcdp_field_map.html
  - local styles folder with css files
  - local src folder with js files
