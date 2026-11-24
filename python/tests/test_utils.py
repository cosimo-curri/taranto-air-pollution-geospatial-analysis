"""Offline raster-alignment and metric regression tests."""

from pathlib import Path
from tempfile import TemporaryDirectory
import sys
import unittest

import numpy as np
import rasterio
from rasterio.transform import from_origin

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from main import build_models, evaluate_predictions  # noqa: E402
from utils import load_aligned_rasters, resample_as_tiff  # noqa: E402


class RasterTests(unittest.TestCase):
    @staticmethod
    def raster(path, data, transform):
        with rasterio.open(path, 'w', driver='GTiff', height=data.shape[0], width=data.shape[1],
                           count=1, dtype=data.dtype, crs='EPSG:4326', transform=transform) as dst:
            dst.write(data, 1)

    def test_resampling_matches_reference_grid(self):
        with TemporaryDirectory() as root:
            root = Path(root)
            reference, covariate, result = [root / x for x in ('reference.tif','covariate.tif','result.tif')]
            self.raster(reference, np.ones((4, 4), dtype='float32'), from_origin(0, 4, 1, 1))
            self.raster(covariate, np.arange(4, dtype='float32').reshape((2, 2)), from_origin(0, 4, 2, 2))
            resample_as_tiff(reference, covariate, result)
            with rasterio.open(reference) as ref, rasterio.open(result) as out:
                self.assertEqual((out.height, out.width, out.crs, out.transform),
                                 (ref.height, ref.width, ref.crs, ref.transform))
                self.assertTrue(np.isfinite(out.read(1)).all())

    def test_load_aligned_rasters_preserves_pixel_pairs(self):
        with TemporaryDirectory() as root:
            root = Path(root)
            transform = from_origin(0, 2, 1, 1)
            target = root / 'target.tif'
            cov = root / 'cov.tif'
            self.raster(target, np.array([[10, 20], [30, 40]], dtype='float32'), transform)
            self.raster(cov, np.array([[1, 2], [3, 4]], dtype='float32'), transform)
            x, y, shape = load_aligned_rasters(target, [cov])
            self.assertEqual(shape, (2, 2))
            np.testing.assert_allclose(x[:, 0] * 10, y)

    def test_loader_excludes_nodata_targets_and_keeps_covariate_gaps(self):
        with TemporaryDirectory() as root:
            root = Path(root)
            transform = from_origin(0, 2, 1, 1)
            target, cov = root / 'target.tif', root / 'cov.tif'
            self.raster(target, np.array([[10, 20], [30, np.nan]], dtype='float32'), transform)
            self.raster(cov, np.array([[1, np.nan], [3, 4]], dtype='float32'), transform)
            features, labels, shape = load_aligned_rasters(target, [cov])
            self.assertEqual(shape, (2, 2))
            np.testing.assert_allclose(labels, [10, 20, 30])
            self.assertTrue(np.isnan(features[1, 0]))
            np.testing.assert_allclose(features[[0, 2], 0], [1, 3])

    def test_loader_rejects_too_few_valid_targets(self):
        with TemporaryDirectory() as root:
            root = Path(root)
            transform = from_origin(0, 2, 1, 1)
            target, cov = root / 'target.tif', root / 'cov.tif'
            self.raster(target, np.array([[np.nan, 2], [np.nan, 4]], dtype='float32'), transform)
            self.raster(cov, np.ones((2, 2), dtype='float32'), transform)
            with self.assertRaisesRegex(ValueError, 'Insufficient valid target observations'):
                load_aligned_rasters(target, [cov])

    def test_load_aligned_rasters_rejects_grid_mismatch(self):
        with TemporaryDirectory() as root:
            root = Path(root)
            target, cov = root / 'target.tif', root / 'cov.tif'
            self.raster(target, np.ones((2, 2), dtype='float32'), from_origin(0, 2, 1, 1))
            self.raster(cov, np.ones((2, 2), dtype='float32'), from_origin(1, 2, 1, 1))
            with self.assertRaisesRegex(ValueError, 'grid mismatch'):
                load_aligned_rasters(target, [cov])


class ModelTests(unittest.TestCase):
    def test_metrics_are_elementwise(self):
        result = evaluate_predictions([1, 3], [2, 1])
        self.assertAlmostEqual(result['ME'], .5)
        self.assertAlmostEqual(result['MAE'], 1.5)
        self.assertAlmostEqual(result['RMSE'], np.sqrt(2.5))

    def test_metrics_reject_mismatched_targets(self):
        with self.assertRaisesRegex(ValueError, 'matching shapes'):
            evaluate_predictions([1, 2, 3], [1, 2])

    def test_models_maintain_identical_forest_parameters(self):
        baseline, pca_model = build_models()
        self.assertEqual(baseline.named_steps['forest'].n_estimators, 100)
        self.assertEqual(pca_model.named_steps['forest'].n_estimators, 100)
        self.assertEqual(baseline.named_steps['forest'].get_params(),
                         pca_model.named_steps['forest'].get_params())

    def test_models_have_training_only_transformers(self):
        baseline, pca_model = build_models()
        self.assertIn('imputer', baseline.named_steps)
        self.assertEqual(pca_model.named_steps['pca'].n_components, 2)
        self.assertEqual(baseline.named_steps['forest'].random_state, 42)
        self.assertEqual(pca_model.named_steps['forest'].random_state, 42)


if __name__ == '__main__':
    unittest.main()
