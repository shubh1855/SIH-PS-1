# Training & Feature Engineering Notebooks

This directory will contain Jupyter notebooks for:

- **Feature engineering**: Extracting elevation, slope, land cover from raster data
- **Model training**: Random Forest classifier training on NASA Global Landslide Catalog data
- **Evaluation**: Confusion matrix, feature importance plots, cross-validation

## Datasets Required

| Dataset | Source | Purpose |
|---------|--------|---------|
| NASA Global Landslide Catalog | [NASA EarthData](https://data.nasa.gov/Earth-Science/Global-Landslide-Catalog/h9d8-neg4) | Positive training samples |
| SRTM 30m DEM | [USGS EarthExplorer](https://earthexplorer.usgs.gov/) | Elevation + slope features |
| ESA WorldCover 10m | [ESA Viewer](https://viewer.esa.int/viewer/) | Land cover classification |

## Output

The trained model will be serialized to `backend/model/landslide_model.joblib` using joblib.
