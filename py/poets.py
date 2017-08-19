from topology import get_grid

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

modules = []
connections = []


def clear():
    del modules[:]
    del connections[:]


def change(new_mods, new_cons):
    del modules[:]
    del connections[:]
    modules.extend(new_mods)
    connections.extend(new_cons)


def update():

    new_mods, new_cons = get_grid(corePoets, 5, 5, "corePoets_%d_%d")

    change(new_mods, new_cons)
