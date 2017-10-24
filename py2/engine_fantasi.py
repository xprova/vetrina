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
        'series': {
            0: {'lineWidth': 2, 'color': '#A1BEE6'},
            1: {'lineWidth': 1, 'color': '#A1BEE6'},
            2: {'lineWidth': 1, 'color': '#A1BEE6'}
        },
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
    points = [[0,0,0,0]]

    while True:

        request = json.loads(input())

        # Respond to engine name queries:

        if "get" in request:
            if request["get"] == "engine_name":
                print_json({"result": "success", "return": "FANTASI"})
                continue

        # Respond to example plot queries:

        if "eval" in request:

            words = request["eval"].split()
            cmd = words[0]

            if cmd == "dummy":
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

            if cmd == "plot":
                nodes_max = int(words[1])
                points = [[0,0,0,0]]
                # nodes_max = 200
                ymax = 0.03
                print_json(get_chart([[-1, -1, -1, -1]], nodes_max, ymax, include_options=True))
                for ind, item in enumerate(run_sweep(terminal, 1, nodes_max, 10)):
                    min_, avg, max_ = item
                    points.append([ind+1, avg, min_, max_])
                    print_json(get_chart(points, nodes_max, ymax))
                print_json(get_chart(points, nodes_max, ymax, result="success"))
                continue

            if cmd == "print":
                nodes_max = (int(words[1]) + 1) if len(words)>1 else len(points)
                sformat = "%14s" * 4
                header1 = ['Removed Nodes', 'Average', 'Min', 'Max']
                header2 = ['-------------', '-------', '---', '---']
                sheet = [header1, header2] + points[:nodes_max]
                lines = [sformat % tuple(map(str, row)) for row in sheet]
                content = "\n".join(lines)
                response = {
                    "result": "success",
                    "return": content,
                    "type": "text"
                }
                print_json(response)
                continue


            if cmd == "download":
                sheet = [['Removed Nodes', 'Average', 'Min', 'Max']] + points
                lines = [", ".join([str(item) for item in row]) for row in sheet]
                content = "\n".join(lines)
                response = {
                    "result": "success",
                    "return": {
                        "filename": "data.csv",
                        "content": content
                    },
                    "type": "download"
                }
                print_json(response)
                continue

            # Otherwise:

        print_json({"result": "error", "description": "unsupported"})


if __name__ == '__main__':
    main()
