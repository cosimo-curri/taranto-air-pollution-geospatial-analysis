// Draw monthly mean concentration graphs from the interpolated Earth Engine assets.
var utils = require("users/YOUR_USERNAME/default:dependencies/utils");
var base = "projects/YOUR_PROJECT_ID/assets/interpolated_data/JANUARY_DECEMBER_2023/";
var months = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
];
var series = [
  {substance: "CH4", unit: "CH4 (mol fraction)"},
  {substance: "CO", unit: "CO (mol/m^2)"},
  {substance: "NO2", unit: "NO2 (mol/m^2)"},
  {substance: "SO2", unit: "SO2 (mol/m^2)"}
];

series.forEach(function(spec) {
  var values = months.map(function(month) {
    // The original December SO2 raster contains no valid sample values.
    // A chart gap denotes missing data rather than an observed zero.
    if (spec.substance === "SO2" && month === "DECEMBER") {
      return null;
    }
    var filename = spec.substance + "_" + month + "_2023";
    return utils.methods.meanAllValuesTIFF(base + spec.substance + "/" + filename);
  });
  utils.methods.exportLineGraph(values, spec.unit);
});
