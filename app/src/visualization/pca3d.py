# src/visualization/pca3d.py

import matplotlib.pyplot as plt


def plot_pca_3d(
    X_pca,
    labels_go,
    groups,
    explained_variance,
    label_go,
    group_names,
    colors_go,
    colors_group,
):
    """
    Plot PCA 3D projections.
    """

    fig = plt.figure(figsize=(16, 7))

    ax1 = fig.add_subplot(121, projection="3d")

    for go in sorted(label_go.keys()):

        mask = labels_go == go

        ax1.scatter(
            X_pca[mask, 0],
            X_pca[mask, 1],
            X_pca[mask, 2],
            color=colors_go[go],
            label=label_go[go],
            alpha=0.45,
            s=18,
        )

    ax1.set_title("PCA 3D — GO-i")

    ax1.set_xlabel(
        f"PC1 ({explained_variance[0]:.1f}%)"
    )

    ax1.set_ylabel(
        f"PC2 ({explained_variance[1]:.1f}%)"
    )

    ax1.set_zlabel(
        f"PC3 ({explained_variance[2]:.1f}%)"
    )

    ax1.legend()

    # -----------------------------------

    ax2 = fig.add_subplot(122, projection="3d")

    for g in sorted(group_names.keys()):

        mask = groups == g

        ax2.scatter(
            X_pca[mask, 0],
            X_pca[mask, 1],
            X_pca[mask, 2],
            color=colors_group[g],
            label=group_names[g],
            alpha=0.45,
            s=18,
        )

    ax2.set_title("PCA 3D — Groups")

    ax2.set_xlabel(
        f"PC1 ({explained_variance[0]:.1f}%)"
    )

    ax2.set_ylabel(
        f"PC2 ({explained_variance[1]:.1f}%)"
    )

    ax2.set_zlabel(
        f"PC3 ({explained_variance[2]:.1f}%)"
    )

    ax2.legend()

    plt.tight_layout()

    return fig