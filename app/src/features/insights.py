def generate_insights(labels_go, groups):

    insights = []

    risk_rate = (labels_go == 1).mean()

    if risk_rate > 0.4:

        insights.append({
            "title": "Aumento de riesgo nutricional",
            "severity": "high",
            "description": (
                f"Alta proporción en cluster riesgo: "
                f"{risk_rate:.2%}"
            ),
        })

    if (groups == 2).mean() > 0.5:

        insights.append({
            "title": "Mejora en desarrollo cognitivo",
            "severity": "positive",
            "description": (
                "Concentración elevada en grupo TC"
            ),
        })

    if len(labels_go) > 100:

        insights.append({
            "title": "Muestra robusta",
            "severity": "info",
            "description": (
                "Dataset con tamaño suficiente "
                "para clustering estable"
            ),
        })

    return insights