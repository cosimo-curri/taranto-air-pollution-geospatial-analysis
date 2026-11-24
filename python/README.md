# Python spatial-covariate experiment

The experiment fits two Random Forest regressors to the Sentinel-5P NO₂ raster with three geospatial covariates (elevation, precipitation, and land-surface temperature). One branch uses the three input covariates; the other uses two principal components.

Requires **Python 3.12**. From the repository root:

```bash
python -m venv .venv
source .venv/bin/activate             # Windows: .venv\\Scripts\\activate
python -m pip install -r python/requirements.txt
python python/main.py
```

By default, the script uses the original resampled GeoTIFF files committed under `data/covariates/resampled/`, preserving the reference grids. It prints metrics to the terminal and saves exploratory plots under `results/generated/figures/`. To regenerate intermediate rasters under `results/generated/resampled/` without overwriting the preserved files:

```bash
python python/main.py --resample
```

To run without charts, use `--no-figures`. The output path can be changed with `--output-dir`. The model uses `random_state=42` for both the train/test split and each Random Forest, and preprocessing transformers are fitted on training observations only. Both models are evaluated on paired pixel/target observations.

Metrics include mean error (ME), mean absolute error (MAE), root mean squared error (RMSE), square root of MAE (RMAE, for continuity with the university experiment), relative RMSE and R². This experiment is a covariate-based spatial regression: it does not produce a full RFsp distance-feature surface.

Offline tests (run from the repository root):

```bash
python -m unittest discover -s python/tests -v
```

Full GIS and Earth Engine processing is documented separately. The locally generated model metrics are not committed as historical evaluation records.
