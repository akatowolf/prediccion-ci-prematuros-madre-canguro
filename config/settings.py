# config/settings.py

from config.plot_config import PlotConfig


config = PlotConfig(

    # ====================================
    # GO LABELS
    # ====================================

    label_go={
        1: "GO-i 1",
        2: "GO-i 2",
    },

    # ====================================
    # GO COLORS
    # ====================================

    colors_go={
        1: "#1f77b4",
        2: "#d62728",
    },

    # ====================================
    # GROUP COLORS
    # ====================================

    colors_group={
        1: "#2ca02c",
        2: "#9467bd",
        3: "#ff7f0e",
    },

    # ====================================
    # GROUP NAMES
    # ====================================

    group_names={
        1: "KMC",
        2: "TC",
        3: "Reference",
    },

    # ====================================
    # CLUSTERING
    # ====================================

    k_final=2,

    random_state=42,

    # ====================================
    # VARIABLE ABBREVIATIONS
    # ====================================

    abbrev={

        "cvlt_total": "CVLT Total",

        "cvlt_delay_free":
            "Delay Free",

        "cvlt_delay_cued":
            "Delay Cued",

        "cvlt_recognition":
            "Recognition",

        "cvlt_intrusions":
            "Intrusions",

        "cvlt_learning_slope":
            "Slope",
    },
)