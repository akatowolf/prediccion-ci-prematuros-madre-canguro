
from src.features.pca import compute_pca_projection
from src.features.silhouette import compute_silhouette_scores
from src.features.characterization import plot_centroid_heatmap 
from src.features.characterization import build_heatmap_dataframe
from src.features.characterization import compute_cluster_centroids
from src.visualization.silhouette import plot_silhouette
from src.visualization.pca import plot_pca_2d


def run_characterization_pipeline(state):

    # =========================
    # UNPACK STATE
    # =========================

    X_sc = state["X"]["scaled"]
    labels_go = state["labels"]["go"]
    groups = state["labels"]["groups"]

    vars_ok = state["meta"]["features"]
    LABEL_GO = state["meta"]["label_map"]

    # =========================
    # FEATURES
    # =========================

    pca_res = compute_pca_projection(X_sc.values)

    sil_res = compute_silhouette_scores(
        X_sc.values,
        labels_go,
    )

    centroids = compute_cluster_centroids(
        X_sc,
        labels_go,
    )

    df_heat = build_heatmap_dataframe(
        centroids,
        labels_go,
        vars_ok,
        LABEL_GO,
    )

    # =========================
    # VISUALIZATION
    # =========================

    figures = {}

    figures["heatmap"] = plot_centroid_heatmap(df_heat)

    figures["pca_2d"] = plot_pca_2d(
        X_pca=pca_res["X_pca"],
        labels_go=labels_go,
        explained_variance=pca_res["explained_variance"],
    )

    figures["silhouette"] = plot_silhouette(
        sil_samples=sil_res["sil_samples"],
        labels_go=labels_go,
        sil_global=sil_res["sil_global"],
    )

    # =========================
    # OUTPUT
    # =========================

    return {
        "figures": figures,
        "sil_global": sil_res["sil_global"],
    }