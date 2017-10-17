#!/usr/bin/env python

import json
import sys
import time
import random
import pexpect


terminal_path = "/cygdrive/c/bin/quartus/16.1/quartus/bin64/nios2-terminal.exe"


def run_nios():
    """Create a terminal object."""
    terminal = pexpect.spawn(terminal_path)
    terminal.sendline("ping")
    terminal.expect(">>")
    return terminal


def run_sweep(terminal, from_, to, repeat):
    """Run a network analysis sweep across a node range [from_, to] with
    nrepeats per node, and return generated data points."""

    def get_row():
        """Return a result data point [min,avg,max]"""
        def get_val():
            terminal.expect(",")
            return float(terminal.before.strip())
        return [get_val() for _ in range(3)]

    # send command
    cmd = "random-set %d %d %d" % (from_, to, repeat)
    terminal.sendline(cmd)
    terminal.expect(cmd)

    # read results
    nrows = to - from_ + 1
    for _ in range(nrows):
        yield get_row()


def get_chart(points, xmax, ymax, result="update", include_options=False):
    """Return a chart json object"""

    chart = {
        "result": result,
        "type": "chart",
        "return": {
            "data" : [['Removed Nodes', 'Average', 'Min', 'Max']] + points,
        }
    }

    options = {
        'title': 'Average Shortest Path Computation',
        'hAxis': {
            'title': 'Removed Nodes',
            'viewWindow': {
                'min': 0,
                'max': xmax
            },
            'gridlines': {'color': '#eee'}
        },
        'vAxis': {
            'title': 'Impact (units)',
            'viewWindow': {
                'min': -0.01,
                'max': ymax
            },

            'gridlines': {'color': '#eee'}
        },
    }

    if include_options or True:
        chart["return"]["options"] = options

    return chart


def print_json(obj):
    """Output json object."""
    print(json.dumps(obj))
    sys.stdout.flush()


def main():

    terminal = run_nios()

    while True:

        request = json.loads(input())

        # Respond to engine name queries:

        if "get" in request:
            if request["get"] == "engine_name":
                print_json({"result": "success", "return": "FANTASI"})
                continue

        # Respond to example plot queries:

        if request.get("eval") == "dummy":
            npoints = 50
            min_fun = lambda x: (x - 2 - random.random()*10)**2
            avg_fun = lambda x: x**2
            max_fun = lambda x: (x + 2 + random.random()*10)**2
            points = [[x, avg_fun(x), min_fun(x), max_fun(x)] for x in range(npoints+1)]
            for n in range(1, npoints):
                print_json(get_chart(points[:n], 50, 2500))
                time.sleep(0.25)
            print_json(get_chart(points, 50, 2500, result="success"))
            continue

        # Run network analysis:

        if request.get("eval") == "run":
            points = []
            nodes_max = 200
            ymax = 0.03
            print_json(get_chart([[-1, -1, -1, -1]], nodes_max, ymax, include_options=True))
            for ind, item in enumerate(run_sweep(terminal, 1, nodes_max, 10)):
                min_, avg, max_ = item
                points.append([ind, avg, min_, max_])
                print_json(get_chart(points, nodes_max, ymax))
            print_json(get_chart(points, nodes_max, ymax, result="success"))
            continue

        # Otherwise:

        print_json({"result": "error", "description": "unsupported"})


if __name__ == '__main__':
    main()
