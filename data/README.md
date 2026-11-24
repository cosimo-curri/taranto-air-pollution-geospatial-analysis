# Data inventory, provenance and usage

## Archived data structure

| Directory | Contents | File count |
| --- | --- | ---: |
| `sentinel5p/pre_interpolation/2020` | Annual source rasters for 2020 | 4 |
| `sentinel5p/pre_interpolation/2023` | Annual source rasters for 2023 | 4 |
| `sentinel5p/pre_interpolation/monthly_2023` | Monthly source rasters, by gas | 48 |
| `sentinel5p/interpolated/2020` | Annual interpolated rasters for 2020 | 4 |
| `sentinel5p/interpolated/2023` | Annual interpolated rasters for 2023 | 4 |
| `sentinel5p/interpolated/monthly_2023` | Monthly interpolated rasters, by gas | 48 |
| `differences` | Annual 2023-minus-2020 comparison rasters | 4 |
| `covariates/original` | DEM, GPM precipitation, MODIS land-surface temperature | 3 |
| `covariates/resampled` | Three reference-grid-aligned covariate rasters | 3 |
| `arpa` | Historical monitoring-station `.xls` exports | 11 |
| `arpa/stations.xlsx` | Original monitoring-station reference workbook | 1 |

The NO₂ training target from the original Python folder is byte-identical to `sentinel5p/pre_interpolation/2023/mean_collection_NO2_ALL_2023.tif`; a single copy is used in this repository.

GeoTIFFs retain the original pixel values and metadata, including valid-data masks and coordinate reference systems. File naming follows the university experiment, with only directory names standardized. `data/checksums.sha256` provides SHA-256 checksums for all included data files.

## Bands and measurements

| Gas | Earth Engine selected band | Reported measurement type |
| --- | --- | --- |
| NO₂ | `NO2_column_number_density` | Atmospheric column density (mol/m²) |
| SO₂ | `SO2_column_number_density_amf` | Atmospheric column density (mol/m²) |
| CO | `CO_column_number_density` | Atmospheric column density (mol/m²) |
| CH₄ | `CH4_column_volume_mixing_ratio_dry_air_bias_corrected` | Dry-air column-averaged mixing ratio |

GeoTIFFs have different dimensions, valid-data coverage, and original resolutions. Comparing them requires CRS and pixel-grid alignment. NoData cells are not equivalent to observed zeros.

## Provenance and attribution

- **Sentinel-5P:** Copernicus Programme / European Space Agency. This dataset is available through Google Earth Engine and subject to the [Copernicus Sentinel data use terms](https://dataspace.copernicus.eu/terms-and-conditions).
- **DEM:** Copernicus Digital Elevation Model GLO-30, as distributed through Earth Engine. Check its individual attribution and terms.
- **Precipitation:** NASA GPM IMERG V06, as used in the university project. This is a historical dataset version.
- **Surface temperature:** MODIS MOD11A1 Collection 6.1, distributed through Earth Engine.
- **Administrative boundaries (FAO GAUL 2015):** the original Earth Engine scripts reference [`FAO/GAUL/2015/level2`](https://developers.google.com/earth-engine/datasets/catalog/FAO_GAUL_2015_level2) to select the Taranto study area. **No standalone GAUL vector layer is distributed in this repository.** The [GAUL 2015 dataset license](https://developers.google.com/earth-engine/datasets/catalog/DataLicenseGAUL2015.pdf) is not an unrestricted open-data license: it restricts usage to non-commercial purposes, limits redistribution to unauthorized recipients, sets conditions for derivatives, and requires specified attribution when GAUL materials or covered derivatives are published. The exact attribution specified in the license is reproduced below. Any published material incorporating GAUL geometry remains subject to the applicable license conditions and attribution.
- **ARPA Puglia:** the original study archives 11 historical `.xls` monitoring-station exports and a separate station workbook. The official [Regione Puglia 2023 air-quality data catalog](https://dati.puglia.it/v2/dataset/dati-qualita-aria-2023) and [station metadata dataset](https://dati.puglia.it/v2/dataset/1076238d-3403-49f2-b842-cf17b255ab9b) are marked **Creative Commons Attribution 4.0 International (CC BY 4.0)**. That license permits redistribution, including modified copies, with attribution and a notice of modifications. Publication rights for the archived data have been checked by the repository maintainer; the open-data catalog references are supplied for attribution, not as a claim that the individual historical spreadsheets are byte-identical to a current catalog download. Credit: *ARPA Puglia — Centro Regionale Aria / Regione Puglia Open Data*; retain source links and the collection date/context where known.

### FAO attribution notice

> Source of Administrative boundaries: The Global Administrative Unit Layers (GAUL) dataset, implemented by FAO within the CountrySTAT and Agricultural Market Information System (AMIS) projects

This is the attribution text prescribed by the [GAUL 2015 license](https://developers.google.com/earth-engine/datasets/catalog/DataLicenseGAUL2015.pdf) for relevant uses; attribution does not remove its non-commercial and redistribution restrictions.

**Data licenses are separate from code permissions.** The original [academic report](../docs/academic-report.pdf) is included in the repository. The separately obtained third-party papers and teaching materials remain excluded. The source rights of any figures reused within the academic report should also be respected.
