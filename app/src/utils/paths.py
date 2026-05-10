from pathlib import Path
import os

def get_repo_root() -> Path:
    # Databricks Repos
    if os.environ.get("DATABRICKS_REPO_ROOT"):
        return Path(os.environ["DATABRICKS_REPO_ROOT"])

    # fallback seguro
    return Path(__file__).resolve().parents[2]

def resolve_path(*parts) -> Path:
    return get_repo_root().joinpath(*parts)