# src/visualization/silhouette.py

import numpy as np
import matplotlib.pyplot as plt


def plot_silhouette(
    sil_samples,
    labels_go,
    sil_global,
    colors_go,
    label_go,
):
    """
    Plot silhouette diagram.
    """

    fig, ax = plt.subplots(
        figsize=(8, 6)
    )

    y_lower = 10

    for go in [1, 2]:

        sil_cluster = np.sort(
            sil_samples[labels_go == go]
        )

        n_cluster = sil_cluster.shape[0]

        ax.fill_betweenx(
            np.arange(
                y_lower,
                y_lower + n_cluster,
            ),
            0,
            sil_cluster,
            alpha=0.7,
            color=colors_go[go],
            label=label_go[go],
        )

        y_lower += n_cluster + 10

    ax.axvline(
        sil_global,
        color="red",
        linestyle="--",
        linewidth=2,
    )

    ax.set_title(
        "Silhouette Plot",
        fontweight="bold",
    )

    ax.set_xlabel(
        "Silhouette score"
    )

    plt.tight_layout()

    return fig