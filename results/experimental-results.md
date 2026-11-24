# Experimental outputs

## Archived geospatial analysis

The university dataset includes annual interpolated maps for 2020 and 2023, monthly interpolated maps for 2023 and four difference GeoTIFF products. The [README](../README.md#annual-comparison-data) shows the mean values of the retained difference layers, and the image previews were rendered directly from those data files.

- `data/differences/CH4_difference_2020_2023.tif`
- `data/differences/CO_difference_2020_2023.tif`
- `data/differences/NO2_difference_2020_2023.tif`
- `data/differences/SO2_difference_2020_2023.tif`

## Python regression and PCA

`python/main.py` compares two Random Forest regression variants using elevation, precipitation and land-surface temperature covariates. The second variant uses two principal components. It computes train/test ME, MAE, RMSE, RMAE, RRMSE and R². Exploratory PCA and correlation figures can be generated on demand.

```bash
python python/main.py
```

The command reports the values produced by the installed Python environment. The archived raster datasets and the university report remain the primary record of the original research activity. No model checkpoint or pre-generated model-performance table is represented as a newly reproduced result.

## Visualization scripts

- `gee/results/export_graphs_months_2023.js` — monthly mean-value charts.
- `gee/results/comparison_2020_2023.js` — annual difference exports and statistics.
- `gee/results/comparison_ARPA.js` — sampling at selected station coordinates.
- `gee/results/taranto_neighboring_cities.js` — comparisons within municipal study-area polygons.

These scripts require the original or re-uploaded Earth Engine assets and an authenticated Earth Engine session.
