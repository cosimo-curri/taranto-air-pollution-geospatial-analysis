// Annual differences for the four monitored substances (2023 minus 2020).
var utils = require("users/YOUR_USERNAME/default:dependencies/utils");
var base = "projects/YOUR_PROJECT_ID/assets/interpolated_data/";

["CH4", "CO", "NO2", "SO2"].forEach(function(substance) {
  var source2020 = base + "2020/" + substance + "_ALL_2020";
  var source2023 = base + "2023/" + substance + "_ALL_2023";
  var stats = utils.methods.exportDifferenceTIFF(
    source2020, source2023, substance + "_difference_2020_2023"
  );
  print(substance);
  print(stats);
});
