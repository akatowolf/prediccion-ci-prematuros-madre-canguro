# src/features/characterization.py

import numpy as np
import pandas as pd


def compute_cluster_centroids(
    X,
    labels,
    cluster_ids=(1, 2),
):
    """
    Compute centroids by cluster.
    """

    centroids = np.array([
        X[labels == cluster].mean().values
        for cluster in cluster_ids
    ])

    return centroids


def build_heatmap_dataframe(
    centroids,
    labels,
    feature_names,
    label_go,
):
    """
    Build dataframe for heatmap plotting.
    """

    return pd.DataFrame(
        centroids,
        index=[
            f"{label_go[g]}\n(n={int((labels == g).sum())})"
            for g in [1, 2]
        ],
        columns=feature_names,
    )