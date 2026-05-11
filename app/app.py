import streamlit as st
import joblib

from src.pipelines.characterization_pipeline import run_characterization_pipeline

st.title("🧠 Insights Explorer")

# =========================
# LOAD STATE
# =========================

state = joblib.load("data/post_processing/analysis_state.joblib")


# =========================
# RUN PIPELINE
# =========================

if st.button("Run analysis"):

    results = run_characterization_pipeline(state=state)

    st.metric(
        "Silhouette",
        f"{results['sil_global']:.3f}"
    )

    figures = results["figures"]

    # =========================
    # VISUALS
    # =========================

    st.subheader("📊 PCA 2D")
    st.pyplot(figures["pca_2d"])

    st.subheader("🧬 Heatmap (Centroids)")
    st.pyplot(figures["heatmap"])

    st.subheader("👥 Group Composition")
    st.pyplot(figures["group_composition"])

    st.subheader("📈 Silhouette")
    st.pyplot(figures["silhouette"])

    st.subheader("🎯 Radar Profile")
    st.pyplot(figures["radar"])

    st.subheader("🧊 PCA 3D")
    st.pyplot(figures["pca_3d"])