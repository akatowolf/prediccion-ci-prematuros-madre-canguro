# src/visualization/radar.py

import matplotlib.pyplot as plt
import numpy as np


def plot_radar_chart(
    centroids_norm,
    vars_ok,
    abbrev,
    label_go,
    colors_go,
):
    """
    Plot radar chart.
    """

    labels = [
        abbrev.get(v, v)
        for v in vars_ok
    ]

    n = len(labels)

    angles = [
        i / n * 2 * np.pi
        for i in range(n)
    ]

    angles += angles[:1]

    fig, ax = plt.subplots(
        figsize=(7, 7),
        subplot_kw=dict(polar=True)
    )

    for idx, go in enumerate(sorted(label_go.keys())):

        vals = centroids_norm[idx].tolist()

        vals += vals[:1]

        ax.plot(
            angles,
            vals,
            "o-",
            lw=2,
            color=colors_go[go],
            label=label_go[go],
        )

        ax.fill(
            angles,
            vals,
            alpha=0.12,
            color=colors_go[go],
        )

    ax.set_xticks(angles[:-1])

    ax.set_xticklabels(labels)

    ax.set_ylim(0, 1)

    ax.set_title(
        "Cognitive Profile by Domain",
        fontweight="bold",
    )

    ax.legend()

    return fig