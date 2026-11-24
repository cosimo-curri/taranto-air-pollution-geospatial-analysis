var italianProvinces = ee.FeatureCollection("FAO/GAUL/2015/level2");

////////////////////////////////
/// export_pre_interpolation ///
////////////////////////////////

//INCLUDING DEPENDENCIES
var utils = require("users/YOUR_USERNAME/default:dependencies/utils");

var tarantoProvinceGeometry = italianProvinces.filter(ee.Filter.eq("ADM2_NAME", "Taranto"));

var substances = ["NO2", "SO2", "CH4", "CO"];
var monthsName = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

//JANUARY-DECEMBER 2023 MEANS
substances.forEach(function(substance) {
  monthsName.forEach(function(month) {
    utils.methods.googleDriveExport(substance, tarantoProvinceGeometry, month, "2023");
  });
});

//2023 MEANS
substances.forEach(function(substance) {
  utils.methods.googleDriveExport(substance, tarantoProvinceGeometry, "ALL", "2023");
});

//2020 MEANS
substances.forEach(function(substance) {
  utils.methods.googleDriveExport(substance, tarantoProvinceGeometry, "ALL", "2020");
});