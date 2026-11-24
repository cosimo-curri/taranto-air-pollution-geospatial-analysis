var italianProvinces = ee.FeatureCollection("FAO/GAUL/2015/level2"),
    DEM_collection = ee.ImageCollection("COPERNICUS/DEM/GLO30"),
    GPM_collection = ee.ImageCollection("NASA/GPM_L3/IMERG_V06"),
    MOD11A1_061_collection = ee.ImageCollection("MODIS/061/MOD11A1");

////////////////////////////////
/// export_RFsp_co_variables ///
////////////////////////////////

var tarantoProvinceGeometry = italianProvinces.filter(ee.Filter.eq("ADM2_NAME", "Taranto"));

var DEM_data = DEM_collection.filterBounds(tarantoProvinceGeometry);
var GPM_data = GPM_collection.filterBounds(tarantoProvinceGeometry).filterDate("2023-01-01", "2024-01-01");
var MOD11A1_061_data = MOD11A1_061_collection.filterBounds(tarantoProvinceGeometry).filterDate("2023-01-01", "2024-01-01");

var DEM_mean = DEM_data.reduce(ee.Reducer.mean()).reproject({
  crs: DEM_data.first().projection(),
  scale: DEM_data.first().projection().nominalScale() //NO PYRAMIDAL REDUCTION
}).select("DEM_mean");

var GPM_mean = GPM_data.reduce(ee.Reducer.mean()).reproject({
  crs: GPM_data.first().projection(),
  scale: GPM_data.first().projection().nominalScale() //NO PYRAMIDAL REDUCTION
}).select("HQprecipitation_mean");

var MOD11A1_061_mean = MOD11A1_061_data.reduce(ee.Reducer.mean()).reproject({
  crs: MOD11A1_061_data.first().projection(),
  scale: MOD11A1_061_data.first().projection().nominalScale() //NO PYRAMIDAL REDUCTION
}).select("LST_Day_1km_mean");

var exportRegion = tarantoProvinceGeometry.geometry().bounds();

var exportScale_DEM = DEM_mean.projection().nominalScale().getInfo();
var exportScale_GPM = GPM_mean.projection().nominalScale().getInfo();
var exportScale_MOD11A1_061 = MOD11A1_061_mean.projection().nominalScale().getInfo();

Export.image.toDrive({
  image: DEM_mean,
  description: "DEM_mean_ALL_2023",
  region: exportRegion,
  scale: exportScale_DEM,
  crs: "EPSG:4326"
});

Export.image.toDrive({
  image: GPM_mean,
  description: "GPM_mean_ALL_2023",
  region: exportRegion,
  scale: exportScale_GPM,
  crs: "EPSG:4326"
});

Export.image.toDrive({
  image: MOD11A1_061_mean,
  description: "MOD11A1_061_mean_ALL_2023",
  region: exportRegion,
  scale: exportScale_MOD11A1_061,
  crs: "EPSG:4326"
});