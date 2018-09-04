from topology import get_grid
from subprocess import check_output as run

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

init = lambda: get_grid(corePoets, 5, 5, "corePoets_%d_%d")

def ls():
    output = run("ls")
    lines = [line.decode() for line in output.split(b'\n') if line]
    for line in lines:
        print(line)
