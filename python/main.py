"""Reproducible Random Forest and PCA experiment on Taranto raster covariates."""

import argparse
import json
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn.decomposition import PCA
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from utils import load_aligned_rasters, resample_as_tiff

PROJECT_ROOT = Path(__file__).resolve().parents[1]
TARGET_RELATIVE_PATH = Path('data/sentinel5p/pre_interpolation/2023/mean_collection_NO2_ALL_2023.tif')
COVARIATES = ('DEM_mean_ALL_2023', 'GPM_mean_ALL_2023', 'MOD11A1_061_mean_ALL_2023')
FEATURE_NAMES = ('DEM', 'GPM', 'MOD11A1_061')


def build_models():
    """Use the same split and training-only imputation for both regressions."""
    def forest():
        return RandomForestRegressor(n_estimators=100, random_state=42)
    baseline = Pipeline([
        ('imputer', SimpleImputer(strategy='mean')),
        ('forest', forest()),
    ])
    with_pca = Pipeline([
        ('imputer', SimpleImputer(strategy='mean')),
        ('scaler', StandardScaler()),
        ('pca', PCA(n_components=2)),
        ('forest', forest()),
    ])
    return baseline, with_pca


def evaluate_predictions(expected, predicted):
    """Evaluate pixel-aligned 1-D targets and predictions."""
    expected = np.asarray(expected, dtype=np.float64).reshape(-1)
    predicted = np.asarray(predicted, dtype=np.float64).reshape(-1)
    if expected.shape != predicted.shape:
        raise ValueError('Targets and predictions must have matching shapes')
    mae = mean_absolute_error(expected, predicted)
    rmse = np.sqrt(mean_squared_error(expected, predicted))
    mean_expected = np.mean(expected)
    return {
        'ME': float(np.mean(expected - predicted)),
        'MAE': float(mae),
        'RMSE': float(rmse),
        'RMAE': float(np.sqrt(mae)),  # Retained from the university experiment.
        'RRMSE': float(rmse / mean_expected) if mean_expected else None,
        'R2': float(r2_score(expected, predicted)),
    }


def create_figures(features, trained_pca_model, output_dir):
    """Save the three exploratory charts implemented in the original project."""
    output_dir.mkdir(parents=True, exist_ok=True)
    variance = trained_pca_model.named_steps['pca'].explained_variance_ratio_
    imputed = trained_pca_model.named_steps['imputer'].transform(features)
    scaled = trained_pca_model.named_steps['scaler'].transform(imputed)
    projected = trained_pca_model.named_steps['pca'].transform(scaled)

    fig, ax = plt.subplots(figsize=(7, 4))
    ax.bar([1, 2], variance * 100)
    ax.set(xticks=[1, 2], xlabel='Principal component', ylabel='Explained variance (%)', title='PCA scree plot')
    ax.grid(axis='y', alpha=0.2)
    fig.tight_layout()
    fig.savefig(output_dir / 'pca_scree.png', dpi=160)
    plt.close(fig)

    fig, ax = plt.subplots(figsize=(7, 5))
    ax.scatter(projected[:, 0], projected[:, 1], s=4, alpha=0.25)
    ax.set(xlabel=f'PC1 ({variance[0] * 100:.2f}%)', ylabel=f'PC2 ({variance[1] * 100:.2f}%)', title='PCA feature projection')
    fig.tight_layout()
    fig.savefig(output_dir / 'pca_scatter.png', dpi=160)
    plt.close(fig)

    dataframe = pd.DataFrame(features, columns=FEATURE_NAMES)
    fig, ax = plt.subplots(figsize=(7, 5))
    sns.heatmap(dataframe.corr(), annot=True, cmap='coolwarm', fmt='.2f', ax=ax)
    ax.set_title('Covariate correlation matrix')
    fig.tight_layout()
    fig.savefig(output_dir / 'covariate_correlation.png', dpi=160)
    plt.close(fig)


def run_experiment(project_root=PROJECT_ROOT, resample=False, output_dir=None, figures=True):
    """Run both regression branches with paired targets and a fixed split."""
    project_root = Path(project_root)
    output_dir = Path(output_dir) if output_dir else project_root / 'results/generated'
    target_path = project_root / TARGET_RELATIVE_PATH
    covariate_dir = project_root / 'data/covariates'

    if resample:
        resampled_dir = output_dir / 'resampled'
        paths = [resample_as_tiff(target_path,
                                  covariate_dir / 'original' / f'{name}.tif',
                                  resampled_dir / f'{name}_resampled.tif')
                 for name in COVARIATES]
    else:
        paths = [covariate_dir / 'resampled' / f'{name}_resampled.tif' for name in COVARIATES]

    features, labels, shape = load_aligned_rasters(target_path, paths)
    x_train, x_test, y_train, y_test = train_test_split(
        features, labels, test_size=0.2, random_state=42,
    )
    baseline, with_pca = build_models()
    metrics = {}
    for name, model in [('random_forest', baseline), ('random_forest_pca', with_pca)]:
        model.fit(x_train, y_train)
        metrics[name] = {
            'train': evaluate_predictions(y_train, model.predict(x_train)),
            'test': evaluate_predictions(y_test, model.predict(x_test)),
        }

    variance = with_pca.named_steps['pca'].explained_variance_ratio_
    metrics['metadata'] = {
        'grid_rows': shape[0],
        'grid_columns': shape[1],
        'valid_samples': int(len(labels)),
        'train_samples': int(len(y_train)),
        'test_samples': int(len(y_test)),
        'pca_explained_variance_ratio': [float(v) for v in variance],
        'train_test_random_state': 42,
    }
    if figures:
        create_figures(features, with_pca, output_dir / 'figures')
    return metrics


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project-root', type=Path, default=PROJECT_ROOT)
    parser.add_argument('--output-dir', type=Path, help='Directory for generated figures and resampled rasters')
    parser.add_argument('--resample', action='store_true', help='Recreate covariate rasters using bilinear reprojection')
    parser.add_argument('--no-figures', action='store_true', help='Compute metrics without saving charts')
    args = parser.parse_args()
    results = run_experiment(args.project_root, args.resample, args.output_dir, not args.no_figures)
    print(json.dumps(results, indent=2, allow_nan=False))


if __name__ == '__main__':
    main()
