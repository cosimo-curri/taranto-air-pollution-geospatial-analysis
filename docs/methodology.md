# Methodology

## Context

This university Image Processing study examined pollution-related atmospheric measurements over the province of Taranto, Italy, using the satellite-data processing environment of Google Earth Engine and GIS raster processing. The original work was completed during academic year 2023–2024.

## Processing stages

1. **Territorial selection.** The study selects the Taranto province administrative area using `FAO/GAUL/2015/level2` in Earth Engine.
2. **Sentinel-5P image filtering.** The offline L3 collections for NO₂, SO₂, CO and CH₄ are filtered spatially and by study periods. The shared export utility maps each pollutant to its corresponding Earth Engine band.
3. **Temporal means.** A mean reducer produces annual and monthly raster data for 2020 and 2023. `Export.image.toDrive` creates GeoTIFF output tasks.
4. **Geographic interpolation.** ArcGIS Pro converts raster cells to point features and uses the selected empirical Bayesian kriging (EBK) approach to produce the retained surfaces. The archived products include 56 interpolated GeoTIFF datasets; recorded tool settings are summarized in [ArcGIS workflow notes](arcgis-workflow.md).
5. **Annual and monthly analysis.** The `gee/results/` scripts compute and display annual differences, time-series charts and values within the selected municipalities, along with sampling at monitoring-station coordinates.
6. **Covariate-based modelling.** Google Earth Engine exports a digital elevation model, a precipitation raster and a land-surface temperature raster. Python resamples these onto the same grid as the Sentinel-5P NO₂ target and trains two Random Forest variants, with and without PCA features.

## Experiment parameters

The Python experiment trains Random Forest models with `n_estimators=100`, `random_state=42` and an 80/20 train/test partition. A two-component PCA alternative uses training-fitted mean imputation and feature standardization. Both branches use paired raster pixels and the same partition.

For the GEE component, `filterDate` uses an inclusive start and an exclusive end. The date helper constructs these boundaries from calendar months. The source collections and projection choices remain explicitly visible in the scripts; replacing or upgrading them may change the scientific dataset.

## Interpretation

- NO₂, SO₂ and CO satellite bands represent atmospheric-column products. Methane is a column-averaged dry-air mixing-ratio product, not a ground-station concentration.
- Differences between two annual layers are descriptive comparisons of the corresponding archived data products.
- ARPA Puglia monitoring stations provide ground-based reference observations with different units and spatial/temporal sampling characteristics; raw values should not be treated as directly equivalent without the appropriate conversion or analysis.
- The Python component demonstrates regression with spatial covariates and PCA; it does not implement every distance-feature component of the published RFsp methodology.

For source data and document availability, consult [the data inventory](../data/README.md) and [reproducibility notes](reproducibility.md).
