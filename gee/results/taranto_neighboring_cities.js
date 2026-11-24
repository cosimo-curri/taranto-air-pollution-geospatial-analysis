var tarantoGeometry = /* color: #0b4a8b */ee.Geometry.Polygon(
    [[[17.29615482473464, 40.46817785470349],
      [17.22749014035011, 40.4814971714674],
      [17.222683612449558, 40.47679653784018],
      [17.25873257174314, 40.441270002329134]]]),
statteGeometry = /* color: #ffc82d */ee.Geometry.Polygon(
    [[[17.21846964170741, 40.57997500843045],
      [17.194608710310927, 40.57202156345307],
      [17.192720435164443, 40.563284722884895],
      [17.215208075545302, 40.56171979518544]]]),
massafraGeometry = /* color: #00ffff */ee.Geometry.Polygon(
    [[[17.128175757430068, 40.58913813884011],
      [17.119077704451552, 40.592397027773195],
      [17.12062265684413, 40.597610919714185],
      [17.11392786314296, 40.59982670066708],
      [17.106546423933974, 40.58770417739531],
      [17.12165262510585, 40.581968024145894]]]);

// Compare 2023 raster means within the three study-area geometries.
var utils = require("users/YOUR_USERNAME/default:dependencies/utils");
var base = "projects/YOUR_PROJECT_ID/assets/interpolated_data/2023/";

[tarantoGeometry, statteGeometry, massafraGeometry].forEach(function(geometry) {
  ["CH4", "CO", "NO2", "SO2"].forEach(function(substance) {
    print(utils.methods.meanAllValuesGeometryTIFF(
      base + substance + "_ALL_2023", geometry
    ));
  });
});
