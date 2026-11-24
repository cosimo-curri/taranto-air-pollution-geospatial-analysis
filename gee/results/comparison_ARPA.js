// Sample 2023 interpolated satellite-derived rasters at ARPA station locations.
// Coordinates are inherited from the original experiment (UTM zone 33N).
var utils = require("users/YOUR_USERNAME/default:dependencies/utils");
var base = "projects/YOUR_PROJECT_ID/assets/interpolated_data/2023/";

var stations = [
  {name: "CISI", easting: 690889, northing: 4488018, substances: ["NO2", "CO", "SO2"]},
  {name: "Talsano", easting: 693783, northing: 4475985, substances: ["NO2", "SO2"]},
  {name: "Ponte Wind", easting: 684114, northing: 4488423, substances: ["NO2", "SO2"]},
  {name: "Grottaglie", easting: 705279, northing: 4490271, substances: ["NO2"]},
  {name: "Martina Franca", easting: 697012, northing: 4508162, substances: ["NO2"]},
  {name: "Massafra", easting: 679111, northing: 4495815, substances: ["NO2", "SO2"]}
];

stations.forEach(function(station) {
  print(station.name);
  station.substances.forEach(function(substance) {
    print(utils.methods.valueUTM(
      base + substance + "_ALL_2023", station.easting, station.northing
    ));
  });
});
