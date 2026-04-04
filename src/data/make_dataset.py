# src/data/make_dataset.py

import logging
import pandas as pd
from src.data.load_data import load_data

logger = logging.getLogger(__name__)

def make_dataset():
    logger.info("Loading data...")
    df = load_data()

    logger.info("Cleaning data...")

    # 👉 EJEMPLOS (ajústalos a tu dataset real)
    
    # eliminar duplicados
    df = df.drop_duplicates()

    # eliminar filas completamente vacías
    df = df.dropna(how="all")

    # ejemplo: rellenar nulos
    # df["columna"] = df["columna"].fillna(0)

    logger.info("Dataset listo")

    return df


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    df = make_dataset()

    print(df.head())