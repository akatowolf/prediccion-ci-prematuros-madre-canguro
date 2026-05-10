# src/visualization/pca.py

import matplotlib.pyplot as plt


def plot_pca_2d(
    X_pca,
    labels_go,
    explained_variance,
    colors_go,
    label_go,
):
    """
    Plot PCA 2D projection.
    """

    fig, ax = plt.subplots(
        figsize=(8, 6)
    )

    for go in [1, 2]:

        mask = labels_go == go

        ax.scatter(
            X_pca[mask, 0],
            X_pca[mask, 1],
            c=colors_go[go],
            label=label_go[go],
            alpha=0.6,
            s=25,
        )

    ax.set_xlabel(
        f"PC1 ({explained_variance[0]:.1f}%)"
    )

    ax.set_ylabel(
        f"PC2 ({explained_variance[1]:.1f}%)"
    )

    ax.legend()

    ax.set_title(
        "PCA Projection",
        fontweight="bold",
    )

    plt.tight_layout()

    return fig