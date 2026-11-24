# Reproducibility notes

## What can be reproduced locally

- Read and inspect all committed GeoTIFFs using Rasterio.
- Rebuild two illustrated maps from the archived raster inputs via `python/render_maps.py`.
- Run the two Python Random Forest variants with a fixed 80/20 split and train-only preprocessing.
- Resample covariate rasters to the Sentinel-5P NO₂ grid using bilinear reprojection (`--resample`); generated intermediates are stored outside the preserved input directories.
- Run Python unit tests locally; optionally run the offline JavaScript tests using Node.js.

## What requires external systems

- **Google Earth Engine:** service access, an enabled Cloud project, hosted source collections and (for result scripts) uploads of the provided interpolated GeoTIFFs. Replace the `YOUR_USERNAME`/`YOUR_PROJECT_ID` placeholders in the JavaScript files. See the [exact asset mapping and execution sequence](../gee/README.md). Access to any former academic account is not required.
- **ArcGIS Pro:** compatible licensed software and a manual recreation of the EBK procedure. The report records the major tool parameters, now summarized in [the ArcGIS guide](arcgis-workflow.md), but not every setting or the original `.aprx`.
- **Original data sources:** some hosted collections and API behaviors can change; use the catalog identifiers shown in source code and consult the providers' documentation before changing versions.

## Python runtime

The source virtual environment specified **CPython 3.12.3 on Windows**. Dependency versions in `python/requirements.txt` were recovered from that environment's installed package metadata. The original virtual environment itself is not distributed; install dependencies into a clean environment.

The original raster files were copied without pixel-value transformations. The Python program consumes the committed, already-resampled covariate rasters by default. An optional resampling pass produces fresh raster files under `results/generated/resampled/`, leaving the archived inputs untouched. Review generated outputs before staging Git changes.

The fixed random seed controls the train/test partition and Random Forest sampling. Cross-platform numerical and library implementations can still lead to small differences; complete bit-for-bit equivalence is not guaranteed across environments.

## Validation approach

Node.js is optional and is needed only for the offline JavaScript checks; they use built-in modules and require no npm dependencies.

1. Run offline tests: `python -m unittest discover -s python/tests -v` and `node gee/tests/test_date_windows.js && node gee/tests/test_scripts.js`.
2. Run `python python/main.py --no-figures` to validate full model training and metric computation on the committed raster inputs.
3. Optionally run `python python/main.py --resample` and confirm all raster grids align.
4. Verify that the four exported difference rasters and the year-specific interpolated rasters are readable in a GIS viewer.
5. For a fresh hosted run, configure the GEE module and asset paths in [gee/README.md](../gee/README.md). ArcGIS Pro can reproduce the documented EBK workflow using the recorded settings in [the ArcGIS notes](arcgis-workflow.md), but missing per-run settings prevent a claim of exact historical output equivalence.

The distributed raster files are the archived reference outputs. New model outputs and hosted imagery exports are generated separately and may differ with source-collection versions, processing parameters and runtime environments.
