import streamlit as st

from config.settings import config
from src.pipelines.characterisation_pipeline import (
    run_characterisation_pipeline,
)
from src.features.insights import generate_insights


# =========================================================
# UI CONFIG
# =========================================================

st.set_page_config(
    page_title="Insights Explorer",
    layout="wide",
)

st.title("🧠 Insights Explorer")


# =========================================================
# SIDEBAR (CONTROL PANEL)
# =========================================================

st.sidebar.header("⚙️ Controls")

run_btn = st.sidebar.button("Run analysis")

show_insights = st.sidebar.checkbox(
    "Show insights",
    value=True,
)

show_plots = st.sidebar.checkbox(
    "Show plots",
    value=True,
)


# =========================================================
# EXECUTION
# =========================================================

if run_btn:

    with st.spinner("Running pipeline..."):

        results = run_characterisation_pipeline(
            X_sc=X_sc,
            labels_go=labels_go,
            vars_ok=vars_ok,
            config=config,
        )

    st.success("Pipeline completed")


    # =====================================================
    # METRICS
    # =====================================================

    st.metric(
        "Silhouette global",
        f"{results['sil_global']:.3f}",
    )


    # =====================================================
    # INSIGHTS
    # =====================================================

    if show_insights:

        st.subheader("🧠 Insights")

        insights = generate_insights(
            labels_go=labels_go,
            groups=groups,
        )

        if len(insights) == 0:
            st.info("No insights detected")

        for ins in insights:

            if ins["severity"] == "high":
                st.error(ins["title"])

            elif ins["severity"] == "positive":
                st.success(ins["title"])

            else:
                st.info(ins["title"])

            st.caption(ins["description"])


    # =====================================================
    # VISUALIZATIONS
    # =====================================================

    if show_plots:

        st.subheader("📊 Characterisation Plots")

        tabs = st.tabs([
            "Heatmap",
            "PCA 2D",
            "Silhouette",
        ])

        with tabs[0]:
            st.pyplot(
                results["figures"]["heatmap"]
            )

        with tabs[1]:
            st.pyplot(
                results["figures"]["pca_2d"]
            )

        with tabs[2]:
            st.pyplot(
                results["figures"]["silhouette"]
            )


else:

    st.info(
        "Click 'Run analysis' to execute the pipeline"
    )