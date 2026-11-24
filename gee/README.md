# Google Earth Engine: setup and execution

The JavaScript scripts in this directory run in the [Earth Engine Code Editor](https://code.earthengine.google.com/), **not in Node.js**. The archived GeoTIFFs, report and Python analysis can be used without Earth Engine. A new Earth Engine user can set up the hosted stages independently; no access to the academic team's original account is required.

## 1. Prepare your Earth Engine workspace

1. Sign in to an account with Earth Engine enabled and select an Earth Engine-enabled Google Cloud project in the Code Editor.
2. In the **Scripts** tab, create or select a script repository (the examples assume the `default` repository). Save `gee/dependencies/utils.js` as a script named `dependencies/utils` in that repository.
3. In every script containing a `require(...)`, replace:

   ```javascript
   require("users/YOUR_USERNAME/default:dependencies/utils")
   ```

   with the module path shown by **your** Code Editor script repository, for example `users/alice/default:dependencies/utils`. If your script repository is not `default`, substitute its real name.
4. Copy the remaining `.js` files into the Code Editor as individual scripts. The `gee/tests/` scripts are **offline Node.js tests** and should not be run in the Code Editor. Node.js is optional and needed only for these checks; no npm packages are required.

Earth Engine scripts use the hosted [Sentinel-5P](https://developers.google.com/earth-engine/datasets/catalog/sentinel-5p), [Copernicus DEM](https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_DEM_GLO30), [GPM IMERG V06](https://developers.google.com/earth-engine/datasets/catalog/NASA_GPM_L3_IMERG_V06), [MODIS](https://developers.google.com/earth-engine/datasets/catalog/MODIS_061_MOD11A1) and [FAO GAUL 2015](https://developers.google.com/earth-engine/datasets/catalog/FAO_GAUL_2015_level2) collections. Data access, usage terms and available versions are determined by the providers. Avoid silently substituting data collection versions.

## 2. Upload archived outputs for the result scripts

The four `gee/results/` scripts read **interpolated rasters as Earth Engine image assets**; a `.tif` path on your computer is not an Earth Engine asset ID. Use the Code Editor **Assets** tab to create folders and upload GeoTIFF images; wait until ingestion tasks have completed. See the official [raster upload guide](https://developers.google.com/earth-engine/guides/image_upload) and [asset management guide](https://developers.google.com/earth-engine/guides/manage_assets).

In each result script, replace the example base prefix

```javascript
projects/YOUR_PROJECT_ID/assets/interpolated_data/
```

with the actual asset folder prefix in your enabled Earth Engine project. The examples assume a folder named `interpolated_data` with the following mapping (**do not include the `.tif` suffix in the image asset ID**):

| Local GeoTIFF(s) in the repository | Destination asset ID(s), relative to `projects/YOUR_PROJECT_ID/assets/interpolated_data/` | Used by |
| --- | --- | --- |
| `data/sentinel5p/interpolated/2020/<GAS>_ALL_2020.tif` | `2020/<GAS>_ALL_2020` | `comparison_2020_2023.js` |
| `data/sentinel5p/interpolated/2023/<GAS>_ALL_2023.tif` | `2023/<GAS>_ALL_2023` | Annual comparisons, station sampling and neighboring cities |
| `data/sentinel5p/interpolated/monthly_2023/<GAS>/<GAS>_<MONTH>_2023.tif` | `JANUARY_DECEMBER_2023/<GAS>/<GAS>_<MONTH>_2023` | `export_graphs_months_2023.js` |

`<GAS>` is `CH4`, `CO`, `NO2` or `SO2`. `<MONTH>` is the full uppercase English month name, such as `JANUARY`. The annual scripts require **eight** raster image assets (four gases in each of two years). The chart script uses **47** nonempty monthly raster images: the archived December SO₂ image has no valid observations and is deliberately rendered as a missing chart value. Its archived file is named `SO2_DECEMBER_2023_E.tif` and is not needed for that chart. Uploading the 47 other monthly GeoTIFFs and the eight annual images is sufficient for all four result scripts.

For example, upload `data/sentinel5p/interpolated/2023/NO2_ALL_2023.tif` as:

```text
projects/YOUR_PROJECT_ID/assets/interpolated_data/2023/NO2_ALL_2023
```

The uploaded GeoTIFFs are expected to be **single-band images with band name `b1`**, which is what the result helpers read. Verify the imported image's band name in the Assets panel; if it differs, adapt the helpers to that actual band name. Keep the GeoTIFF georeferencing and NoData semantics during ingestion. The local folder arrangement under `data/` does not automatically create these Earth Engine asset folders.

## 3. Execution order

**A. Generate fresh source exports (optional if using the archived GeoTIFFs).**

1. Run `export_pre_interpolation.js`. It submits 56 `Export.image.toDrive` tasks (48 monthly and eight annual Sentinel-5P means); start/monitor the tasks in the Code Editor **Tasks** tab and download the resulting TIFFs from Drive.
2. Run `export_RFsp_co_variables.js` to submit the three ancillary DEM, GPM and MODIS exports. These are intended for the local Python covariate workflow, not for the four GEE `results/` scripts.
3. To produce GIS-interpolated rasters from fresh satellite exports, follow [the ArcGIS Pro workflow](../docs/arcgis-workflow.md). Existing interpolated outputs are already included under `data/sentinel5p/interpolated/`.

**B. Inspect the supplied interpolated products in Earth Engine.**

4. Upload the required **archived interpolated** TIFFs and set the matching asset prefix as described in section 2.
5. Run `results/comparison_2020_2023.js` (annual differences and summary statistics), `results/comparison_ARPA.js` (sampling at fixed monitoring-station coordinates), `results/taranto_neighboring_cities.js` (means over the supplied study-area polygons), or `results/export_graphs_months_2023.js` (monthly charts). These are independent entry points and can run in any order once their assets exist.
6. For `comparison_2020_2023.js`, review and start the difference-raster export tasks if you want to store new outputs. The four archived difference rasters are already available under `data/differences/`.

**C. Run local Python independently.** The RF/PCA analysis can run directly on the checked-in rasters without executing either hosted stage: see [python/README.md](../python/README.md).

## Important scope

The code and archived rasters are provided, while access to Earth Engine, service availability and import permissions are managed by Google. Newly generated exports may vary with provider availability, collection versions, parameters and GIS processing choices; they are not claimed to match the archived rasters byte for byte. For the source interpretation and exact archived artifacts, consult the [academic report](../docs/academic-report.pdf) and [reproducibility notes](../docs/reproducibility.md).
