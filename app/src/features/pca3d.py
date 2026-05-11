# src/features/pca3d.py

from sklearn.decomposition import PCA


def compute_pca_3d(X):
    """
    Compute PCA 3D projection.
    """

    pca = PCA(
        n_components=3,
        random_state=42,
    )

    X_pca = pca.fit_transform(X)

    explained_variance = (
        pca.explained_variance_ratio_ * 100
    )

    return {
        "X_pca": X_pca,
        "explained_variance": explained_variance,
    }