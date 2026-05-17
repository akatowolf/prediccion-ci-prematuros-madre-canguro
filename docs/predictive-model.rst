Predictive model
================

Este documento describe el flujo del modelo predictivo global y los dominios asociados
(WASI, TAP, CVLT) en el backend.

Overview
--------

El proyecto usa modelos XGBoost serializados como bundles `joblib` para hacer inferencias.
Los bundles incluyen tanto la versión global como modelos específicos de dominio.

Bundles disponibles
-------------------

- `kmc20_model_bundle_calibrated.joblib`: modelo global de riesgo cognitivo.
- `m8_modelo_binary_best.joblib`: modelo de dominio WASI.
- `m9_tap_bundle.joblib`: modelo de dominio TAP.
- `m10_cvlt_bundle.joblib`: modelo de dominio CVLT.

Inferencia en el backend
------------------------

El endpoint principal es `/api/predecir`. Su ejecución sigue estos pasos:

1. Transformar la entrada del paciente a características mediante `build_feature_dict()`.
2. Para cada bundle requerido (`global`, `wasi`, `tap`, `cvlt`):
   - cargar el bundle desde `BUNDLES`
   - extraer `feature_cols`, `imputer`, `scaler` y `threshold`
   - imputar valores faltantes y escalar la fila de entrada si los objetos están presentes
   - calcular la probabilidad con `clf.predict_proba()`

El método `predict_from_bundle()` soporta dos formatos de bundle:

- `predict(patient_dict)` disponible directamente en el bundle.
- un bundle clásico con `clf`, `imputer` y `scaler`.

Criterios de riesgo
-------------------

La probabilidad de salida se clasifica según dos cortes:

- `prob >= 0.50` → `Alto Riesgo`
- `threshold <= prob < 0.50` → `Riesgo Moderado`
- `prob < threshold` → `Bajo Riesgo`

El campo `threshold` es específico del bundle y permite ajustar el umbral de riesgo moderado.
El objeto de salida incluye también:

- `probabilidad`: probabilidad de clase positiva
- `risk_label`: etiqueta de riesgo en texto
- `alert_level`: nivel de alerta categorizado
- `above_threshold`: booleano de superación de umbral
- `threshold_usado`: el umbral usado para la decisión
- `calibrado`: si se usó `clf_cal`

Ingeniería de características
----------------------------

`build_feature_dict()` genera un diccionario de entrada con variables derivadas relevantes:

- `F_delta_waz_3m_12m`: cambio relativo en peso entre 3 y 12 meses.
- `SCB_nivm1`: nivel educativo materno.
- `F_catchup_hc_fenton`: catch-up de perímetro cefálico con z-scores de Fenton.
- `PMD_coaudl6`: escala auditiva de Griffiths.
- `NEO_totoxidias`: días de oxígeno neonatal.
- `EX41_talla8`: talla al alta neonatal.
- `NEO_HOSP`: días de hospitalización.
- `PMD_cogrif6`: motivo de ingreso general.
- `EX41_durPCconcontroles03`: horas de cuidado madre canguro.

Los valores numéricos faltantes se representan como `nan` y se imputan antes de la predicción.

Explicabilidad con SHAP
----------------------

El backend intenta calcular explicaciones SHAP usando `shap.TreeExplainer` sobre el clasificador
XGBoost puro (`clf_raw`). Si esto falla, hay un fallback con `feature_importances_`.

La salida incluye:

- `shap_values`
- `top_risk_factors`
- `top_protective`
- `method`

Este mecanismo permite complementar la predicción con explicación de variables.

Relevancia de los dominios
--------------------------

Además del predictor global, el proyecto presenta predicciones por dominio:

- WASI: rendimiento intelectual general.
- TAP: memoria de trabajo y atención.
- CVLT: memoria verbal.

Los resultados por dominio ayudan a desagregar el riesgo cognitivo en subcomponentes clínicamente relevantes.
