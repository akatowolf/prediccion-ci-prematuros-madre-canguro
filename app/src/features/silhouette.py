# src/features/silhouette.py

from sklearn.metrics import silhouette_samples


def compute_silhouette_scores(X, labels):
    """
    Compute silhouette scores.
    """

    sil_samples = silhouette_samples(X, labels)

    sil_global = sil_samples.mean()

    return {
        "sil_samples": sil_samples,
        "sil_global": sil_global,
    }