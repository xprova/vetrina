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
    "ports": {}
}

modules = []
connections = []

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
    del modules[:]

    mod_dict = {}

    def get_id(i, j):
        return f'corePOETS_{i}_{j}'

    def makePoets(i, j):
        id_ = get_id(i, j)
        return makeModule(corePoets, id_, 200*i, -200*j)

    def drange(w, h):
        return itertools.product(range(w), range(h))

    for i, j in drange(5, 5):
        new_poets = makePoets(i, j)
        mod_dict[new_poets["id"]] = new_poets
        modules.append(new_poets)

    for i, j in drange(4, 5):
        core1, core2 = get_id(i, j), get_id(i + 1, j)
        mod_dict[core1]["ports"]["E"] = {"position": "right"}
        mod_dict[core2]["ports"]["W"] = {"position": "left"}
        connections.append([core1, core2, "E", "W"])

    for i, j in drange(5, 4):
        core1, core2 = get_id(i, j), get_id(i, j + 1)
        mod_dict[core1]["ports"]["N"] = {"position": "top"}
        mod_dict[core2]["ports"]["S"] = {"position": "bottom"}
        connections.append([core1, core2, "N", "S"])

def print_modules():
    print(json.dumps(modules, indent=4))