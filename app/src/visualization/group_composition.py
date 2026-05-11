# src/visualization/group_composition.py

import matplotlib.pyplot as plt
import numpy as np
import matplotlib.patches as mpatches


def plot_group_composition(
    composition,
    labels_go,
    groups,
    label_go,
    group_names,
    colors_go,
    colors_group,
):

    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    unique_go = sorted(label_go.keys())
    unique_groups = sorted(group_names.keys())

    # =====================================================
    # LEFT: group distribution within cluster
    # =====================================================

    x = np.arange(len(unique_go))
    w = 0.25

    for gi, g in enumerate(unique_groups):

        vals = [
            composition["group_within_cluster"][go][gi]
            for go in unique_go
        ]

        axes[0].bar(
            x + gi * w,
            vals,
            w,
            label=group_names[g],
            color=colors_group[g],
            alpha=0.85,
            edgecolor="white",
        )

    axes[0].set_xticks(x + w)
    axes[0].set_xticklabels(
        [
            f"{label_go[go]}\n(n={(labels_go==go).sum()})"
            for go in unique_go
        ]
    )

    axes[0].set_ylabel("% within cluster")
    axes[0].set_title("Group distribution within GO-i")
    axes[0].legend()

    # =====================================================
    # RIGHT: cluster distribution within group
    # =====================================================

    for gi, g in enumerate(unique_groups):

        bottom = 0

        for i, go in enumerate(unique_go):

            pct = composition["cluster_within_group"][g][i]

            axes[1].bar(
                gi,
                pct,
                bottom=bottom,
                color=colors_go[go],
                edgecolor="white",
                width=0.6,
                alpha=0.85,
            )

            bottom += pct

    axes[1].set_xticks(range(len(unique_groups)))
    axes[1].set_xticklabels(
        [
            f"{group_names[g]}\n(n={(groups==g).sum()})"
            for g in unique_groups
        ]
    )

    axes[1].set_ylabel("% within group")
    axes[1].set_title("GO-i distribution within groups")

    handles = [
        mpatches.Patch(color=colors_go[g], label=label_go[g])
        for g in unique_go
    ]

    axes[1].legend(handles=handles)

    plt.tight_layout()

    return fig