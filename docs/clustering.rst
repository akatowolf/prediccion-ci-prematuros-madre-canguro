Clustering analysis
===================

This page documents the domain-specific clustering analysis available in the project.
It links the backend API, the frontend dashboard, and the notebook sources used to build
cluster variants for CVLT, TAP, and WASI.

Overview
--------

The repository includes an analysis pipeline for three domain-specific cluster variants:

- **CVLT**: verbal memory and recall profiles.
- **TAP**: attention and working memory performance.
- **WASI**: general intellectual functioning measured by Full Scale IQ.

The domain clustering metadata is defined in `api/main.py` and connected to
`app/data/processed/clusters_GOi.csv` for cohort-level summaries.

Backend endpoints
-----------------

The FastAPI backend exposes the following endpoints for cluster and PCA analysis:

- `/api/pca-clusters`
  - returns the global PCA projection of the processed dataset
  - includes point coordinates, explained variance, cluster labels, and counts
- `/api/cluster-domain-analysis`
  - returns domain-specific cluster variants for CVLT, TAP, and WASI
  - includes PCA projections, cohort counts, and metadata for each variant

Source notebooks
----------------

The notebooks that define and document the domain clustering variants are:

- `notebooks/clustering-models/Clustering_CVLT_GOi_v1.ipynb`
- `notebooks/clustering-models/Clustering_TAP_GOi_v1.ipynb`
- `notebooks/clustering-models/Clustering_WASI_GOi_v1.ipynb`

These notebooks are the source of truth for:

- variable selection for each domain
- cluster labelling rules
- PCA and group summary visualizations

Frontend integration
--------------------

The React dashboard in `src/App.jsx` consumes the backend endpoints and renders:

- a global PCA scatter plot for the full dataset
- a summary panel with cluster counts and explained variance
- separate domain cards for CVLT, TAP, and WASI with
  individual PCA projections and cohort cluster summaries

Data files
----------

- `app/data/processed/kmc_dataset_procesado_completo.csv`
  - processed cohort dataset used for PCA visualization
- `app/data/processed/clusters_GOi.csv`
  - GO-i cluster labels used for coloring the PCA projection

How to use
----------

1. Start the backend API with Uvicorn.
2. Start the frontend with Vite.
3. Open the analysis dashboard and navigate to the "Análisis de clusters" section.

Notes
-----

The clustering variants are intentionally separated from the KMC prediction workflow.
They provide an orthogonal exploratory view of cognitive profiles and cohort structure.
