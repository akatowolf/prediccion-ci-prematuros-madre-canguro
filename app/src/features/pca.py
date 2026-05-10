# src/features/pca.py

from sklearn.decomposition import PCA


def compute_pca_projection(
    X,
    n_components=2,
    random_state=42,
):
    """
    Compute PCA projection and explained variance.
    """

    pca = PCA(
        n_components=n_components,
        random_state=random_state,
    )

    X_pca = pca.fit_transform(X)

    explained_variance = (
        pca.explained_variance_ratio_ * 100
    )

    return {
        "pca_model": pca,
        "X_pca": X_pca,
        "explained_variance": explained_variance,
    }