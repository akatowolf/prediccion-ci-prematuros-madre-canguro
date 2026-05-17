Arquitectura del sistema
=======================

Visión general
---------------

Este documento describe la arquitectura de alto nivel del sistema: componentes, flujo de datos,
responsabilidades y consideraciones operativas para despliegue y gobernanza.

Diagrama (Mermaid)
-------------------

.. code-block:: mermaid

   flowchart LR
     subgraph Frontend
       A[React + Vite (`src/`)]
     end
     subgraph Backend
       B[FastAPI (`api/main.py`)]
     end
     Data[(`app/data/`, `data/`)]
     Models[(`models/`, `*.joblib`)]
     Notebooks[`notebooks/`]
     Storage[("Artefactos: S3 / Filesystem / Registry")]

     A -->|HTTP / REST| B
     B -->|read/write| Data
     B -->|load model bundles| Models
     Notebooks -->|produce artifacts| Models
     Notebooks --> Data
     Models --> Storage
     B -->|metrics/logs| Observability(("Logs / Metrics / Tracing"))

Componentes y responsabilidades
-------------------------------

- **Frontend (`src/`)**: interfaz React para interacción clínica, visualizaciones (PCA) y consumo de APIs.
- **Backend (`api/main.py`)**: FastAPI expone endpoints de inferencia y análisis estático; carga bundles `joblib`.
- **Data (`app/data/`, `data/`)**: almacenamiento de datos raw, interim y processed; `clusters_GOi.csv` y dataset preprocesado.
- **Modelos (`models/`)**: artefactos serializados (`joblib`) con metadatos (`feature_cols`, `threshold`, `model_version`).
- **Notebooks**: fuente de verdad para exploración, selección de variables y generación de artefactos.
- **Observability**: sistema para logs estructurados, métricas de inferencia y alertas operativas.

Patrones y contratos
--------------------

- API: usar JSON schemas para entradas (`/api/predecir`) y salidas (predicción + `shap` + `meta`). Documentar con OpenAPI.
- Model bundle: cada bundle debe incluir `feature_cols`, `threshold`, `metrics` y `model_version` en su metadata.
- Datos: establecer esquemas por etapa (raw→interim→processed) y validar con `pandera` o similar.

ML lifecycle y artefactos
-------------------------

- Entrenamiento y validación se realizan en notebooks o pipelines reproducibles.
- Artefactos validados se serializan como bundles `joblib` y se registran con metadata y checksum.
- Versionado semántico de modelos y retención de registros experimentales (MLflow/MLMD opcional).

Despliegue y entornos
---------------------

- Soporte para `docker` y contenedores: `Dockerfile` ya presente; definir imágenes para `api` y `frontend`.
- Variables de entorno claras por entorno (dev/staging/prod) y `.env.example` documentado.
- Estrategia recomendada: entorno staging con tests de integridad de bundles antes del rollout en producción.

Observabilidad y gobernanza
---------------------------

- Logs estructurados (JSON) con `timestamp`, `level`, `component`, `request_id`, `model_version`.
- Métricas: latencia de inferencia, tasa de errores, uso de memoria, número de `bundles` cargados.
- Políticas de privacidad: catalogar columnas sensibles, anonimizar datos cuando proceda y documentar retenciones.

Runbook mínimo
--------------

- Cómo arrancar localmente: Backend (Uvicorn) y Frontend (Vite).
- Verificar `health` endpoint y bundles cargados.
- Procedimiento para reemplazar un bundle (validar checksum → mover a `models/` → reiniciar servicio).

Referencias
-----------

- Ver `REPO_DOCUMENTATION.md` para instrucciones de alto nivel y `docs/predictive-model.rst` para detalles del predictor.
