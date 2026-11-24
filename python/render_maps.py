"""Render lightweight, source-derived GeoTIFF previews for the repository README."""

from pathlib import Path
import matplotlib.pyplot as plt
import numpy as np
import rasterio

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data'
OUTPUT = ROOT / 'results/figures'


def read_geotiff(path):
    with rasterio.open(path) as source:
        values = source.read(1, masked=True)
        values = np.ma.masked_invalid(values)
        return values, (source.bounds.left, source.bounds.right, source.bounds.bottom, source.bounds.top)


def annual_no2():
    raster_dir = DATA / 'sentinel5p/interpolated'
    years = (2020, 2023)
    source_rasters = [read_geotiff(raster_dir / str(year) / f'NO2_ALL_{year}.tif') for year in years]
    valid = np.concatenate([r[0].compressed() for r in source_rasters])
    lower, upper = np.min(valid), np.max(valid)

    fig, axes = plt.subplots(1, 2, figsize=(10, 4.5), constrained_layout=True)
    for ax, year, (values, extent) in zip(axes, years, source_rasters):
        image = ax.imshow(values, extent=extent, origin='upper', cmap='viridis', vmin=lower, vmax=upper)
        ax.set(title=str(year), xlabel='Longitude (°)', ylabel='Latitude (°)')
        ax.tick_params(labelsize=8)
    fig.suptitle('NO₂ annual interpolated raster — Taranto province')
    fig.colorbar(image, ax=axes, shrink=0.75, label='NO₂ column density (mol/m²)')
    fig.savefig(OUTPUT / 'no2_annual_comparison.png', dpi=150, bbox_inches='tight')
    plt.close(fig)


def pollutant_differences():
    fig, axes = plt.subplots(2, 2, figsize=(9, 8), constrained_layout=True)
    for ax, name in zip(axes.flat, ('CH4', 'CO', 'NO2', 'SO2')):
        values, extent = read_geotiff(DATA / 'differences' / f'{name}_difference_2020_2023.tif')
        if values.compressed().min() < 0 < values.compressed().max():
            bound = np.max(np.abs(values.compressed()))
            image = ax.imshow(values, extent=extent, origin='upper', cmap='coolwarm', vmin=-bound, vmax=bound)
        else:
            image = ax.imshow(values, extent=extent, origin='upper', cmap='viridis')
        ax.set(title=f'{name} — 2023 minus 2020', xlabel='Longitude (°)', ylabel='Latitude (°)')
        ax.tick_params(labelsize=8)
        fig.colorbar(image, ax=ax, shrink=0.75, format='%.2g')
    fig.suptitle('Archived annual-difference rasters — Taranto province')
    fig.savefig(OUTPUT / 'pollutant_difference_maps.png', dpi=150, bbox_inches='tight')
    plt.close(fig)


if __name__ == '__main__':
    OUTPUT.mkdir(parents=True, exist_ok=True)
    annual_no2()
    pollutant_differences()
    print(f'Map previews saved in {OUTPUT}')
