import yaml
import os
import mlflow
import mlflow.sklearn
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import pandas as pd

# ----------------------------
# CARGAR CONFIGURACIÓN
# ----------------------------
with open("config/config.yaml") as f:
    cfg = yaml.safe_load(f)

S3_ARTIFACT_ROOT = cfg["mlflow"]["artifact_root"]

# Tracking local (SQLite)
mlflow.set_tracking_uri("sqlite:///mlruns.db")
mlflow.set_experiment("iris_experiments")

# ----------------------------
# CARGA DE DATOS
# ----------------------------
iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.2, random_state=42
)

# ----------------------------
# EXPERIMENTO MLflow
# ----------------------------
with mlflow.start_run():
    # Modelo
    n_estimators = 50
    model = RandomForestClassifier(n_estimators=n_estimators, random_state=42)
    
    # Entrenar
    model.fit(X_train, y_train)
    
    # Predecir y calcular métricas
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    
    # Registrar parámetros y métricas
    mlflow.log_param("n_estimators", n_estimators)
    mlflow.log_metric("accuracy", acc)
    
    # Registrar modelo en S3
    mlflow.sklearn.log_model(model, artifact_path="model")
    
    # Guardar CSV como artifact
    df_test = pd.DataFrame(X_test, columns=iris.feature_names)
    df_test["target"] = y_test
    df_test_path = "iris_test.csv"
    df_test.to_csv(df_test_path, index=False)
    
    mlflow.log_artifact(df_test_path, artifact_path="artifacts")
    
    print(f"Experiment done! Accuracy: {acc:.3f}")
    print(f"Artifacts saved to {S3_ARTIFACT_ROOT}")