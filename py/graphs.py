from random import randrange
from random import sample

engine_name = "Graphs"

def get_id(i):
    return "n%d" % i

def get_rnode(i):
    return {
        "id": get_id(i),
        "x": randrange(-200, 200, 10),
        "y": randrange(-200, 200, 10),
        "class": "node",
        "classes": ["graph", "hide-label"],
        "border-radius": 10,
        "width": 20,
        "height": 20,
        "ports": {
            "p": {"x": 10, "y": 10}
        }
    }

def rand_con(nodes):
    n = len(nodes)
    x, y = map(get_id, sample(range(n), 2))
    return (x, y, "p", "p")

def init(model, nmods=50, ncons=150):
    nodes = [get_rnode(i) for i in range(nmods)]
    cons = [rand_con(nodes) for _ in range(ncons)]
    model.clear()
    model.add_modules(nodes)
    model.add_connections(cons)

