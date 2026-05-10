import streamlit as st
import joblib

from src.pipelines.characterisation_pipeline import (
    run_characterisation_pipeline,
)

st.title("🧠 Insights Explorer")


# =========================
# LOAD STATE
# =========================

state = joblib.load("../data/post_processing/analysis_state.joblib")


# =========================
# RUN PIPELINE
# =========================

if st.button("Run analysis"):

    results = run_characterisation_pipeline(
        state=state
    )

    st.metric(
        "Silhouette",
        f"{results['sil_global']:.3f}"
    )

    st.pyplot(results["figures"]["pca_2d"])