x = 1
y = 3

engine_name = "POETS"

corePoets = {
    "image": "poets/poets_logo_white.svg",
    "description": "System Core",
    "class": "poets",
    "width": 100,
    "height": 100,
    "ports": {
        "W": {"position": "left"},
        "E": {"position": "right"},
        "N": {"position": "top"},
    }
}


def count():
    return list(range(10))

def table(y, n):
    lines = [f"{x} x {y} = {x*y}" for x in range(1, n+1)]
    for item in lines:
        print(item)
