import itertools
import copy


def drange(w, h):
    return itertools.product(range(w), range(h))


def extend(dict_, attrs):
    extended = copy.deepcopy(dict_)
    for key, val in attrs.items():
        extended[key] = val
    return extended


def get_grid(module_template, w, h, module_name="module_%d_%d"):

    r_port = "E"
    l_port = "W"
    t_port = "N"
    b_port = "S"

    modules = {}
    connections = []

    def get_id(i, j):
        return module_name % (i, j)

    def get_coords(i, j):
        return (200 * i, -200 * j)

    for i, j in drange(w, h):
        mod_id = get_id(i, j)
        x, y = get_coords(i, j)
        attrs = {"id": mod_id, "x": x, "y": y}
        modules[mod_id] = extend(module_template, attrs)

    for i, j in drange(w - 1, h):
        core1, core2 = get_id(i, j), get_id(i + 1, j)
        modules[core1]["ports"][r_port] = {"position": "right"}
        modules[core2]["ports"][l_port] = {"position": "left"}
        connections.append([core1, core2, r_port, l_port])

    for i, j in drange(w, h - 1):
        core1, core2 = get_id(i, j), get_id(i, j + 1)
        modules[core1]["ports"][t_port] = {"position": "top"}
        modules[core2]["ports"][b_port] = {"position": "bottom"}
        connections.append([core1, core2, t_port, b_port])

    return (modules.values(), connections)
