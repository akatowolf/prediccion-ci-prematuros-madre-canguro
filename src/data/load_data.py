import pandas as pd
import yaml
from src.utils.paths import resolve_path

def _get_config():
    config_path = resolve_path("config", "config.yaml")

    with open(config_path, "r") as f:
        return yaml.safe_load(f)


def load_data(stage: str = "processed") -> pd.DataFrame:
    cfg = _get_config()["data"]

    if stage not in cfg:
        raise ValueError(f"Stage inválido: {stage}. Usa: {list(cfg.keys())}")

    stage_cfg = cfg[stage]

    path = resolve_path(stage_cfg["dir"], stage_cfg["file"])

    if not path.exists():
        raise FileNotFoundError(f"No existe: {path}")

    print("Loading:", path)

    if stage == "raw":
        return pd.read_excel(path)

    return pd.read_csv(path)