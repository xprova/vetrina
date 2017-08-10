from functools import partial


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


def make_module(template, attrs):
    mod = {key: val for key, val in template.items()}
    mod.update(attrs)
    return mod


class PoetsEngine(object):

    modules = []

    def __init__(self):
        make_poets = partial(make_module, corePoets)
        self.modules = [
            make_poets({"id": "core1", "x": -200, "y": -200}),
            make_poets({"id": "core2", "x": -200, "y": -400}),
        ]

    def get_modules(self):
        return self.modules

    def count(self, until=20):
        return list(range(until))

    def ping(self):
        return "pong!"

    def get_name(self):
        return "POETS"

