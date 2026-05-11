# src/features/radar.py

import numpy as np


def compute_radar_profiles(
    X_imp,
    labels_go,
):
    """
    Compute normalized radar profiles.
    """

    unique_go = sorted(np.unique(labels_go))

    centroids = np.array([
        X_imp[labels_go == go].mean().values
        for go in unique_go
    ])

    centroids_norm = (
        centroids - centroids.min(axis=0)
    ) / (
        centroids.max(axis=0)
        - centroids.min(axis=0)
        + 1e-9
    )

    return centroids_norm