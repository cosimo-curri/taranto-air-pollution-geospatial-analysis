// Shared helpers for the Google Earth Engine Code Editor.
// Earth Engine filterDate(start, end) uses an exclusive end date.
var BANDS = {
  NO2: "NO2_column_number_density",
  SO2: "SO2_column_number_density_amf",
  CH4: "CH4_column_volume_mixing_ratio_dry_air_bias_corrected",
  CO: "CO_column_number_density"
};

var MONTHS = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
];

var dateWindow = function(monthPeriod, yearPeriod) {
  var year = Number(yearPeriod);
  if (!isFinite(year) || Math.floor(year) !== year || year < 1900 || year > 2100) {
    throw new Error("Invalid year: " + yearPeriod);
  }

  var monthIndex = MONTHS.indexOf(monthPeriod);
  if (monthPeriod !== "ALL" && monthIndex === -1) {
    throw new Error("Invalid month period: " + monthPeriod);
  }

  var firstMonth = monthPeriod === "ALL" ? 1 : monthIndex + 1;
  var lastMonth = monthPeriod === "ALL" ? 13 : monthIndex + 2;
  var start = String(year) + "-" + ("0" + firstMonth).slice(-2) + "-01";
  var endYear = lastMonth === 13 ? year + 1 : year;
  var endMonth = lastMonth === 13 ? 1 : lastMonth;
  var end = String(endYear) + "-" + ("0" + endMonth).slice(-2) + "-01";
  return {startDate: start, endDate: end};
};

var googleDriveExport = function(substance, geometry, monthPeriod, yearPeriod) {
  if (!Object.prototype.hasOwnProperty.call(BANDS, substance)) {
    throw new Error("Unsupported Sentinel-5P substance: " + substance);
  }
  var dates = dateWindow(monthPeriod, yearPeriod);
  var collection = ee.ImageCollection("COPERNICUS/S5P/OFFL/L3_" + substance)
    .filterBounds(geometry)
    .filterDate(dates.startDate, dates.endDate)
    .select(BANDS[substance]);

  // Keep the native projection and scale used in the university workflow.
  var projection = collection.first().projection();
  var meanCollection = collection.reduce(ee.Reducer.mean()).reproject({
    crs: projection,
    scale: projection.nominalScale()
  });
  Export.image.toDrive({
    image: meanCollection,
    description: "mean_collection_" + substance + "_" + monthPeriod + "_" + yearPeriod,
    region: geometry.geometry().bounds(),
    scale: meanCollection.projection().nominalScale().getInfo(),
    crs: "EPSG:4326"
  });
};

var meanAllValuesTIFF = function(path) {
    var TIFF = ee.Image(path);
    
    var region = TIFF.geometry().bounds();
    var scale = TIFF.projection().nominalScale().getInfo();
    
    var meanDictionary = TIFF.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: region,
      scale: scale
    });
    
    return meanDictionary.get("b1");
}
  
var meanAllValuesGeometryTIFF = function(path, geometry) {
    var TIFF = ee.Image(path);
    
    var clippedTIFF = TIFF.clip(geometry);
    
    var region = clippedTIFF.geometry().bounds();
    var scale = clippedTIFF.projection().nominalScale().getInfo();
    
    var meanDictionary = clippedTIFF.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: region,
      scale: scale
    });
    
    return meanDictionary.get("b1");
}
  
var exportLineGraph = function(arrayValues, yTitle) {
    var indices = ee.List.sequence(1, 12);
    
    var features = indices.zip(arrayValues).map(function(item) {
      item = ee.List(item);
      
      return ee.Feature(null, {
        "index": item.get(0),
        "value": item.get(1)
      });
    });
    
    var featureCollection = ee.FeatureCollection(features);
    
    var lineGraph = ui.Chart.feature.byFeature({
      features: featureCollection,
      xProperty: "index",
      yProperties: ["value"]
    })
    .setChartType("LineChart")
    .setOptions({
      hAxis: {title: "Months"},
      vAxis: {title: yTitle},
      lineWidth: 2,
      pointSize: 5,
      series: {
        0: {color: "blue"}
      }
    });
    
    print(lineGraph);
}
  
var exportDifferenceTIFF = function(path1, path2, name) {
    var TIFF1 = ee.Image(path1);
    var TIFF2 = ee.Image(path2);
    
    var differenceTIFF = TIFF2.subtract(TIFF1);
    
    var region = differenceTIFF.geometry();
    var scale = differenceTIFF.projection().nominalScale().getInfo();
    
    var stats = differenceTIFF.reduceRegion({
      reducer: ee.Reducer.mean().combine({
        reducer2: ee.Reducer.stdDev(),
        sharedInputs: true
      }).combine({
        reducer2: ee.Reducer.minMax(),
        sharedInputs: true
      }),
      geometry: region,
      scale: scale,
      crs: "EPSG:4326",
      bestEffort: true
    });
    
    var val = {
      max: stats.get("b1_max"),
      min: stats.get("b1_min"),
      mean: stats.get("b1_mean"),
      stdDev: stats.get("b1_stdDev")
    };
    
    Export.image.toDrive({
      image: differenceTIFF,
      description: name,
      region: region,
      scale: scale,
      crs: "EPSG:4326"
    });
    
    return val;
}
  
var valueUTM = function(path, easting, northing) {
    var TIFF = ee.Image(path);
    
    var UTM33 = "EPSG:32633";
    
    var pointUTM = ee.Geometry.Point([easting, northing], UTM33);
    var pointGeo = pointUTM.transform("EPSG:4326");
    
    var scale = TIFF.projection().nominalScale().getInfo();
    
    var value = TIFF.sample(pointGeo, scale).first().get("b1");
    
    return value;
}
  
exports.methods = {
    dateWindow: dateWindow,
    googleDriveExport: googleDriveExport,
    meanAllValuesTIFF: meanAllValuesTIFF,
    meanAllValuesGeometryTIFF: meanAllValuesGeometryTIFF,
    exportLineGraph: exportLineGraph,
    exportDifferenceTIFF: exportDifferenceTIFF,
    valueUTM: valueUTM
};