from src.features.pca import compute_pca_projection
from src.features.pca3d import compute_pca_3d

from src.features.silhouette import compute_silhouette_scores

from src.features.characterization import (
    compute_cluster_centroids,
    build_heatmap_dataframe,
)

from src.features.group_composition import (
    compute_group_composition,
)

from src.features.radar import (
    compute_radar_profiles,
)

from src.visualization.silhouette import (
    plot_silhouette,
)

from src.visualization.pca import (
    plot_pca_2d,
)

from src.visualization.pca3d import (
    plot_pca_3d,
)

from src.visualization.heatmaps import (
    plot_centroid_heatmap,
)

from src.visualization.group_composition import (
    plot_group_composition,
)

from src.visualization.radar import (
    plot_radar_chart,
)


def run_characterization_pipeline(state):

    # =========================================================
    # UNPACK STATE
    # =========================================================

    X_imp = state["X"]["imputed"]
    X_sc = state["X"]["scaled"]

    labels_go = state["labels"]["go"]
    groups = state["labels"]["groups"]

    vars_ok = state["meta"]["features"]

    LABEL_GO = state["meta"]["label_map"]

    GROUP_NAMES  = {1: "KMC", 2: "TC", 3: "Reference"}

    ABBREV = {
        "CVLT_Trial1a4Total":    "CVLT Total",
        "CVLT_ShortDelay":       "CVLT SD",
        "CVLT_LongDelay":        "CVLT LD",
        "CVLT_LongDelayCued":    "CVLT LD-Cued",
        "CVLT_TotalIntrusions":  "CVLT Intrus.",
        "CVLT_TotalRepetitions": "CVLT Repet.",
        "CVLT_Hits":             "CVLT Hits",
        "CVLT_False_Positives":  "CVLT FP",
    }

    COLORS_GO = {
        1: "#2E86AB",
        2: "#C73E1D",
    }

    COLORS_GROUP = {
        1: "#4CAF50",
        2: "#FF9800",
        3: "#9C27B0",
    }

    # =========================================================
    # FEATURES
    # =========================================================

    # -------------------------
    # PCA 2D
    # -------------------------

    pca_res = compute_pca_projection(
        X_sc.values
    )

    # -------------------------
    # PCA 3D
    # -------------------------

    pca3d_res = compute_pca_3d(
        X_sc.values
    )

    # -------------------------
    # Silhouette
    # -------------------------

    sil_res = compute_silhouette_scores(
        X_sc.values,
        labels_go,
    )

    # -------------------------
    # Centroids
    # -------------------------

    centroids = compute_cluster_centroids(
        X_sc,
        labels_go,
    )

    # -------------------------
    # Heatmap dataframe
    # -------------------------

    df_heat = build_heatmap_dataframe(
        centroids,
        labels_go,
        vars_ok,
        LABEL_GO,
    )

    # -------------------------
    # Group composition
    # -------------------------

    composition = compute_group_composition(
        labels_go,
        groups,
    )

    # -------------------------
    # Radar profiles
    # -------------------------

    radar_profiles = compute_radar_profiles(
        X_imp,
        labels_go,
    )

    # =========================================================
    # VISUALIZATIONS
    # =========================================================

    figures = {}

    # -------------------------
    # Heatmap
    # -------------------------

    figures["heatmap"] = plot_centroid_heatmap(
        df_heat
    )

    # -------------------------
    # PCA 2D
    # -------------------------

    figures["pca_2d"] = plot_pca_2d(
        X_pca=pca_res["X_pca"],
        labels_go=labels_go,
        explained_variance=pca_res["explained_variance"],
        colors_go=COLORS_GO,
        label_go=LABEL_GO,
    )

    # -------------------------
    # Group composition
    # -------------------------

    figures["group_composition"] = plot_group_composition(
        composition=composition,
        labels_go=labels_go,
        groups=groups,
        label_go=LABEL_GO,
        group_names=GROUP_NAMES,
        colors_go=COLORS_GO,
        colors_group=COLORS_GROUP,
    )

    # -------------------------
    # Silhouette
    # -------------------------

    figures["silhouette"] = plot_silhouette(
        sil_samples=sil_res["sil_samples"],
        labels_go=labels_go,
        sil_global=sil_res["sil_global"],
        colors_go=COLORS_GO,
        label_go=LABEL_GO,
    )

    # -------------------------
    # Radar
    # -------------------------

    figures["radar"] = plot_radar_chart(
        centroids_norm=radar_profiles,
        vars_ok=vars_ok,
        abbrev=ABBREV,
        label_go=LABEL_GO,
        colors_go=COLORS_GO,
    )

    # -------------------------
    # PCA 3D
    # -------------------------

    figures["pca_3d"] = plot_pca_3d(
        X_pca=pca3d_res["X_pca"],
        labels_go=labels_go,
        groups=groups,
        explained_variance=pca3d_res["explained_variance"],
        label_go=LABEL_GO,
        group_names=GROUP_NAMES,
        colors_go=COLORS_GO,
        colors_group=COLORS_GROUP,
    )

    # =========================================================
    # OUTPUT
    # =========================================================

    return {
        "figures": figures,
        "sil_global": sil_res["sil_global"],
    }