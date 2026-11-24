"""GeoTIFF grid alignment helpers for the spatial-covariate experiment."""

from pathlib import Path

import numpy as np
import rasterio
from rasterio.warp import Resampling, reproject


def resample_as_tiff(reference_path, source_path, destination_path):
    """Resample a single-band covariate to the reference raster's grid.

    Bilinear resampling is retained from the original experiment. The output
    adopts the reference grid (CRS, transform, width and height) while keeping
    the source raster's numeric dtype and metadata where applicable.
    """
    reference_path = Path(reference_path)
    source_path = Path(source_path)
    destination_path = Path(destination_path)
    destination_path.parent.mkdir(parents=True, exist_ok=True)

    with rasterio.open(reference_path) as reference, rasterio.open(source_path) as source:
        if reference.count != 1 or source.count != 1:
            raise ValueError('Expected single-band reference and covariate rasters')
        if not reference.crs or not source.crs:
            raise ValueError('Both rasters require a defined CRS')

        source_data = source.read(1)
        destination = np.empty((reference.height, reference.width), dtype=source_data.dtype)
        reproject(
            source=source_data,
            destination=destination,
            src_transform=source.transform,
            src_crs=source.crs,
            src_nodata=source.nodata,
            dst_transform=reference.transform,
            dst_crs=reference.crs,
            dst_nodata=source.nodata,
            resampling=Resampling.bilinear,
        )
        profile = source.profile.copy()
        profile.update(
            driver='GTiff',
            width=reference.width,
            height=reference.height,
            transform=reference.transform,
            crs=reference.crs,
            count=1,
        )
        with rasterio.open(destination_path, 'w', **profile) as output:
            output.write(destination, 1)
    return destination_path


def load_aligned_rasters(target_path, covariate_paths):
    """Return aligned covariate features, target vector and grid shape.

    A raster mismatch must be fixed explicitly, rather than combining pixels
    that refer to different geographic locations.
    """
    with rasterio.open(target_path) as target:
        if target.count != 1:
            raise ValueError('The target must be a single-band raster')
        reference_grid = (target.width, target.height, target.crs, target.transform)
        target_data = target.read(1, masked=True).filled(np.nan).astype(np.float64)

    columns = []
    for covariate_path in covariate_paths:
        with rasterio.open(covariate_path) as raster:
            same_dimensions = (raster.width, raster.height) == reference_grid[:2]
            same_crs = raster.crs == reference_grid[2]
            # Bounds-derived transforms may differ by floating-point roundoff.
            same_transform = np.allclose(tuple(raster.transform), tuple(reference_grid[3]),
                                            rtol=0, atol=1e-10)
            if not (same_dimensions and same_crs and same_transform):
                raise ValueError(f'Covariate grid mismatch: {covariate_path}')
            columns.append(raster.read(1, masked=True).filled(np.nan).reshape(-1))

    features = np.column_stack(columns).astype(np.float64)
    labels = target_data.reshape(-1)
    valid_target = np.isfinite(labels)
    features[~np.isfinite(features)] = np.nan
    if valid_target.sum() < 3:
        raise ValueError('Insufficient valid target observations')
    return features[valid_target], labels[valid_target], target_data.shape
