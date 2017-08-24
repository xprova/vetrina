from random import randrange

engine_name = "Graphs"

def get_id(i):
    return "n%d" % i

def get_rnode(i):
    return {
        "id": get_id(i),
        "x": randrange(-200, 200, 5),
        "y": randrange(-200, 200, 5),
        "width": 10,
        "height": 10,
        "ports": {
            "p": {"x": 5, "y": 5}
        }
    }


def init(model):
    nodes = [get_rnode(i) for i in range(5)]
    n0 = get_id(0)
    n1 = get_id(1)
    con = (n0, n1, "p", "p")
    model.clear()
    model.add_modules(nodes)
    model.add_connection(con)

