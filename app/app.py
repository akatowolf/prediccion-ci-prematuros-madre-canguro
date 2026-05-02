import streamlit as st

st.title("🧠 Insights Explorer")

insights = [
    "Aumento de riesgo nutricional",
    "Mejora en desarrollo cognitivo",
    "Anomalía en patrón de alimentación"
]

for i in insights:
    st.write("• " + i)