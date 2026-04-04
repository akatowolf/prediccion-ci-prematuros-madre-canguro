import pandas as pd
import boto3
import yaml
from io import BytesIO
import logging

logger = logging.getLogger(__name__)

def _get_config():
    """Lee la configuración del archivo config/config.yaml"""
    with open("config/config.yaml", "r") as f:
        return yaml.safe_load(f)

def _read_excel_from_s3(bucket: str, key: str) -> pd.DataFrame:
    """Carga un archivo Excel desde S3 y lo devuelve como DataFrame"""
    s3 = boto3.client("s3")
    try:
        obj = s3.get_object(Bucket=bucket, Key=key)
        df = pd.read_excel(BytesIO(obj["Body"].read()))
        return df
    except Exception as e:
        logger.error(f"Error al leer {key} desde el bucket {bucket}: {e}")
        raise

def load_data() -> pd.DataFrame:
    """
    Función pública para cargar los datos desde S3.
    No requiere parámetros, todo se lee desde config/config.yaml.
    """
    cfg = _get_config()
    bucket = cfg["data"]["bucket"]
    file_path = cfg["data"]["file_path"]

    logger.info(f"Cargando datos desde S3: s3://{bucket}/{file_path}")
    df = _read_excel_from_s3(bucket, file_path)
    logger.info(f"Datos cargados: {df.shape[0]} filas, {df.shape[1]} columnas")
    return df

# Para pruebas rápidas desde línea de comandos
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    df = load_data()
    print(df.head())