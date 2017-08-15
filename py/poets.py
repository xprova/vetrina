import copy
import functools
import json
import itertools

x = 1
y = 3

engine_name = "POETS"

corePoets = {
    "image": "poets/poets_logo_white.svg",
    "description": "System Core",
    "class": "poets",
    "classes": ["animate"],
    "width": 100,
    "height": 100,
    "x": 200,
    "y": -200,
    "ports": {
        "W": {"position": "left"},
        "E": {"position": "right"},
        "N": {"position": "top"},
    }
}

modules = []

def clear():
    del modules[:]

def count():
    return list(range(10))

def table(y, n):
    lines = [f"{x} x {y} = {x*y}" for x in range(1, n+1)]
    for item in lines:
        print(item)

def makeModule(template, id_, x, y):
    new_mod = copy.deepcopy(template)
    new_mod["id"] = id_
    new_mod["x"] = x
    new_mod["y"] = y
    return new_mod

makePoets = functools.partial(makeModule, corePoets)

def update():
    clear()
    combs = itertools.product(range(5), range(5))
    def makePoets(i, j):
        id_ = f'corePOETS_{i}_{j}'
        return makeModule(corePoets, id_, 200*i, -200*j)
    [modules.append(makePoets(i, j)) for i, j in combs]

def print_modules():
    print(json.dumps(modules, indent=4))