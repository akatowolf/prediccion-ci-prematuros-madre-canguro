# src/features/group_composition.py

import numpy as np


def compute_group_composition(labels_go, groups, k_final=2):
    """
    Compute percentages for:
    1. Group distribution within GO-i clusters
    2. GO-i distribution within groups
    """

    group_within_cluster = {}
    cluster_within_group = {}

    unique_groups = sorted(np.unique(groups))
    unique_go = sorted(np.unique(labels_go))

    # -----------------------------------
    # Group distribution within cluster
    # -----------------------------------

    for go in unique_go:

        vals = []

        for g in unique_groups:

            pct = (
                ((labels_go == go) & (groups == g)).sum()
                / (labels_go == go).sum()
            ) * 100

            vals.append(pct)

        group_within_cluster[go] = vals

    # -----------------------------------
    # GO distribution within groups
    # -----------------------------------

    for g in unique_groups:

        vals = []

        n_g = (groups == g).sum()

        for go in unique_go:

            pct = (
                ((labels_go == go) & (groups == g)).sum()
                / n_g
            ) * 100

            vals.append(pct)

        cluster_within_group[g] = vals

    return {
        "group_within_cluster": group_within_cluster,
        "cluster_within_group": cluster_within_group,
    }