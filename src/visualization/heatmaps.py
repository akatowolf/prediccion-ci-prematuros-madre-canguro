# src/visualization/heatmaps.py

import matplotlib.pyplot as plt
import seaborn as sns


def plot_centroid_heatmap(
    df_heatmap,
):
    """
    Plot centroid heatmap.
    """

    fig, ax = plt.subplots(
        figsize=(16, 4)
    )

    sns.heatmap(
        df_heatmap,
        cmap="RdBu_r",
        center=0,
        vmin=-1.5,
        vmax=1.5,
        annot=True,
        fmt=".2f",
        linewidths=0.4,
        ax=ax,
        cbar_kws={
            "label": "Z-score",
            "shrink": 0.6,
        },
    )

    ax.set_title(
        "Centroid Profiles",
        fontweight="bold",
    )

    plt.tight_layout()

    return fig