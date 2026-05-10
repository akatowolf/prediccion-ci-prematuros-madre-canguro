from src.features.pca import compute_pca_projection
from src.features.silhouette import compute_silhouette_scores
from src.features.characterization import (
    compute_cluster_centroids,
    build_heatmap_dataframe,
)

from src.visualization.heatmaps import plot_centroid_heatmap
from src.visualization.pca import plot_pca_2d
from src.visualization.silhouette import plot_silhouette


def run_characterisation_pipeline(
    X_sc,
    labels_go,
    vars_ok,
    config,
):

    # =========================
    # PCA
    # =========================

    pca_res = compute_pca_projection(
        X_sc.values,
        n_components=2,
        random_state=config.random_state,
    )

    # =========================
    # SILHOUETTE
    # =========================

    sil_res = compute_silhouette_scores(
        X_sc.values,
        labels_go,
    )

    # =========================
    # CENTROIDS
    # =========================

    centroids = compute_cluster_centroids(
        X_sc,
        labels_go,
    )

    feature_names = [
        config.abbrev.get(v, v)
        for v in vars_ok
    ]

    df_heat = build_heatmap_dataframe(
        centroids,
        labels_go,
        feature_names,
        config.label_go,
    )

    # =========================
    # FIGURES
    # =========================

    figures = {}

    figures["heatmap"] = plot_centroid_heatmap(df_heat)

    figures["pca_2d"] = plot_pca_2d(
        X_pca=pca_res["X_pca"],
        labels_go=labels_go,
        explained_variance=pca_res["explained_variance"],
        colors_go=config.colors_go,
        label_go=config.label_go,
    )

    figures["silhouette"] = plot_silhouette(
        sil_samples=sil_res["sil_samples"],
        labels_go=labels_go,
        sil_global=sil_res["sil_global"],
        colors_go=config.colors_go,
        label_go=config.label_go,
    )

    return {
        "figures": figures,
        "sil_global": sil_res["sil_global"],
    }