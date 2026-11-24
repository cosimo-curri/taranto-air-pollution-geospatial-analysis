# ArcGIS Pro interpolation workflow

The study evaluated multiple interpolation methods and used **Empirical Bayesian Kriging (EBK)** in ArcGIS Pro to prepare the distributed interpolated GeoTIFFs. The original [academic report](academic-report.pdf#page=60) (particularly PDF pages 60–68, corresponding to report pages 53–61) documents the selection process, validation results and the principal tool settings. The original `.aprx` file, tool histories and complete processing-environment exports were not supplied.

All 56 pre-interpolation rasters are included under `data/sentinel5p/pre_interpolation/` and all 56 resulting interpolated rasters under `data/sentinel5p/interpolated/`. The resulting outputs can be inspected and used without ArcGIS Pro.

## Recorded method selection

The study compared IDW, local polynomial interpolation (LPI), radial basis functions (RBF), empirical Bayesian kriging (EBK) and other geostatistical approaches on the annual NO₂ 2023 input. It used ArcGIS Pro cross-validation to assess candidate methods and chose **EBK** for processing the full raster collection. The reference test recorded an EBK **Standard Circular** search neighborhood. Full comparisons and numerical cross-validation values are in the report (PDF pages 63–68); do not reinterpret those values as independently remeasured here.

## Reconstructing the documented processing sequence

For each archived *pre-interpolation* raster:

1. **Import and inspect:** open the GeoTIFF in ArcGIS Pro, confirm its coordinate reference system, spatial extent and meaningful pixels.
2. **Raster to Point:** run the *Raster to Point* geoprocessing tool to create point features. Preserve the source raster coordinate system; inspect the output attribute table and verify that the raster values populate the field **`grid_code`**.
3. **Empirical Bayesian Kriging:** use the *Empirical Bayesian Kriging* geoprocessing tool. The report records the following settings:

   | ArcGIS Pro setting | Value documented by the university report |
   | --- | --- |
   | Input features | Points converted from the current source raster |
   | Z value field | `grid_code` |
   | Search Neighborhood Parameters → Search neighborhood | `Standard Circular` |
   | Environments → Output Coordinate System | Same coordinate reference system as the point features |
   | Environments → Raster Analysis → Mask | The original pre-interpolation GeoTIFF being processed |
   | Output raster | An explicitly named output for the current gas and period |

4. **Run and inspect:** execute the interpolation and inspect the resulting raster and its spatial reference.
5. **Export Raster:** export to **TIFF** format and preserve the coordinate system of the interpolated raster. Use the same gas/period naming convention as in `data/sentinel5p/interpolated/`, so it can be mapped into the [GEE result scripts](../gee/README.md).
6. Repeat for the annual (2020 and 2023) and monthly (2023) raster inputs.

## Parameters and reproduction limits

The report gives the **method**, **value field**, **search-neighborhood type**, **output CRS convention** and **mask**, but does **not** provide a complete, machine-readable record of the optimization state, all interpolation settings, exact output grid/cell sizes or tool/environment versions for every one of the 56 exports. Do not invent missing values or assume the software defaults exactly match the academic run.

A user with ArcGIS Pro can follow the documented steps, inspect the results and use the supplied GeoTIFFs as comparison references. **Bit-for-bit or parameter-for-parameter recreation of all archived interpolated surfaces cannot be guaranteed** without those remaining settings. The published rasters are supplied so the downstream GEE analyses and Python experiments do not depend on reconstructing this interactive stage.
