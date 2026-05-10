import streamlit as st
import joblib


# import sys
# from pathlib import Path

# # subimos al root del proyecto (source_code/)
# sys.path.append(str(Path(__file__).resolve().parents[1]))
# print( f"Current working directory: {Path(__file__).resolve().parents[1]}" )

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

    results = run_characterization_pipeline(
        state=state
    )

    st.metric(
        "Silhouette",
        f"{results['sil_global']:.3f}"
    )

    st.pyplot(results["figures"]["pca_2d"])