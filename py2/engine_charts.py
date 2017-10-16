#!/usr/bin/env python

import json
import sys
import time
import random


def get_chart(result, points):
    return {
        "result": result,
        "return": "chart",
        "data" : [['Number of Cores', 'Performance']] + points,
        "options": {
            'title': 'Average Shortest Path Computation',
            'hAxis': {
                'title': 'Number of Cores',
                'viewWindow': {
                    'min': 0,
                    'max': 50
                },
                'ticks': list(range(0,51,5)),
                'gridlines': {'color': '#eee'}
            },
            'vAxis': {
                'title': 'Performance (units)',
                'viewWindow': {
                    'min': 0,
                    'max': 2500
                },
                'ticks': list(range(0,2501,250)),
                'gridlines': {'color': '#eee'}
            },
            'legend': 'none'
        }
    }


def print_json(obj):
    print(json.dumps(obj))
    sys.stdout.flush()


def main():

    while True:

        request = json.loads(input())

        if "get" in request:
            if request["get"] == "engine_name":
                print_json({"result": "success", "return": "Charts Engine"})
                continue

        if request.get("eval") == "plot":
            npoints = 50
            func = lambda x: x**2+random.random()*100
            points = [[x, func(x)] for x in range(npoints+1)]
            for n in range(1, npoints):
                print_json(get_chart("update", points[:n]))
                time.sleep(0.05)
            print_json(get_chart("success", points))
            continue

        print_json({"result": "error", "description": "unsupported"})


if __name__ == '__main__':
    main()
