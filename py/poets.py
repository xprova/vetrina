from topology import get_grid
from model import Model

engine_name = "POETS"

corePoets = {
    "image": "poets/poets_logo_white.svg",
    "description": "System Core",
    "class": "poets",
    "classes": ["animate", "hide-label"],
    "width": 100,
    "height": 100,
    "x": 200,
    "y": -200,
    "ports": {}
}

model = Model()


def update():
    new_mods, new_cons = get_grid(corePoets, 5, 5, "corePoets_%d_%d")
    model.reset()
    model.add_modules(new_mods)
    model.add_connections(new_cons)
