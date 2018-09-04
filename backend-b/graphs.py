import sys
import os

from model import Model
from random import randrange

sys.path.append("/cygdrive/d/dev/pml")
os.chdir("/cygdrive/d/dev/pml")

from gml import Graph
from gml import generate_xml

from pml import build as pml_build
from pml import prettify_xml

from fabfile import env
from fabfile import rbuild as rbuild
from fabfile import rrun as rrun


from qprofile import run_benchmark_poets


engine_name = "Graphs"
env.host_string = "aesop"
model = Model()
job = {"graph": None, "model": model}
remote_dir = "~/qprofile"
xml_filename = "tmp/demo.xml"
graphml_filename = "tmp/random-graph.graphml"


def make_node(node_id):
    return {
        "id": node_id,
        "x": randrange(-400, 400, 10),
        "y": randrange(-400, 400, 10),
        "description": "Graph Node",
        "class": "node",
        "classes": ["graph", "hide-label"],
        "border-radius": 10,
        "width": 20,
        "height": 20,
        "ports": {
            "p": {"x": 10, "y": 10}
        }
    }


def make_edge(n1, n2, css_class="graph-connection"):
    return (n1, n2, "p", "p", [css_class])


def start():
    global model
    model = init(100, 200)


def graphml():
    # content = {"directed": args["--directed"], "instance": args["--id"]}
    print generate_xml("templates/files/base.graphml", job["graph"], content={})


def write_file(file, content):
    """Write string to file."""
    with open(file, "w") as fid:
        fid.write(content)


def run_psim(xml_filename):
    from subprocess import check_output
    cmd = "/cygdrive/d/dev/psim/env/bin/python /cygdrive/d/dev/psim/psim.py -s %s" % xml_filename
    return check_output(cmd.split())


def pml(quiet=False):

    graph = job["graph"]

    nodes = graph.nodes
    edges = graph.edges

    def split_lines(output):
        return [line.strip() for line in output.split("\n")]

    # params = {"nrounds": 1}
    params = {}

    # write_random_graph(nodes, edges, graphml_filename)
    # write_poets_xml(graphml_filename, params, xml_filename)

    # graphml = generate_xml("templates/files/base.graphml", job["graph"], content={})

    # write_file(graphml_filename, graphml)

    app_file = "networks/app.json"
    xml = pml_build(app_file, graphml_filename, props_file=None, params=params)
    xml_pretty = prettify_xml(xml)

    write_file(xml_filename, xml_pretty)

    if not quiet:
        print xml_pretty


def split_lines(output):
    return [line.strip() for line in output.split("\n")]


def build():
    split_lines(rbuild(xml_filename, remote_dir))


def run():
    job["run-output"] = split_lines(rrun(remote_dir))


def make_graph(nodes, edges):
    return init(nodes, edges)


def results():

    parents = get_parents()

    parent_edges = list()

    for key, val in parents.iteritems():

        if not val['parent'] in parents:
            continue

        parent_id = parents[val['parent']]['id']

        parent_edges.append((val['id'], parent_id))

    graph = Graph(graphml_filename)

    print graph.nodes

    def rev_edge(edge):
        return (edge[1], edge[0])

    def get_edge_class(edge):

        if edge in parent_edges or rev_edge(edge) in parent_edges:
            return 'graph-connection-emph'

        return 'graph-connection-faint'

    edges = [
        make_edge(edge[0], edge[1], get_edge_class(edge))
        for edge in graph.get_edge_list()
    ]

    nodes = [make_node(node_id) for node_id in graph.nodes]

    job["graph"] = graph

    return Model(nodes, edges)


def init():

    graph = Graph(graphml_filename)

    edges = [
        make_edge(edge[0], edge[1])
        for edge in graph.get_edge_list()
    ]

    nodes = [make_node(node_id) for node_id in graph.nodes]

    job["graph"] = graph

    return Model(nodes, edges)


def get_parents():

    psim_output = run_psim(xml_filename)

    import re

    reg1 = r"^(\d)+\W+(n\d+)]"
    pat1 = re.compile(reg1, flags=re.MULTILINE)

    parents = {}

    for line in psim_output.split('\n'):

        if not "last_operation" in line:
            continue

        pre, post = line.split(':')
        post_items = post.split(',')

        parent_str = [item for item in post_items if 'parent' in item][0]
        parent_id = int(parent_str.split('=')[1])

        key = int(pre[:5])
        val = pre[6:-1]

        parents[key] = {"id": val, "parent": parent_id}

    return parents



def main():
    # model = init(20, 100)
    # pml(quiet=True)
    parents = get_parents()
    # import json
    # print(json.dumps(parents, indent=4))
    # run_psim('tmp/output.xml')


if __name__ == '__main__':
    main()
