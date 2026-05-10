import streamlit as st

st.set_page_config(
    page_title="Insights App",
    layout="wide",
)

st.title("🧠 Insights App")

st.markdown(
    """
    Bienvenido al sistema de análisis.

    Usa el menú lateral para navegar:

    - 📊 Characterisation
    - 🧠 Insights Explorer
    """
)

st.info(
    "Selecciona una página desde la barra lateral"
)