# config/plot_config.py

from dataclasses import dataclass
from typing import Dict


@dataclass
class PlotConfig:

    # =========================
    # CLUSTERS
    # =========================

    label_go: Dict[int, str]

    # =========================
    # COLORS
    # =========================

    colors_go: Dict[int, str]

    colors_group: Dict[int, str]

    # =========================
    # GROUPS
    # =========================

    group_names: Dict[int, str]

    # =========================
    # PCA / CLUSTERING
    # =========================

    k_final: int

    random_state: int

    # =========================
    # VARIABLE LABELS
    # =========================

    abbrev: Dict[str, str]