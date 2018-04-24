#!/usr/bin/env python

import json
import sys

def process(request):
    if "get" in request:
        if request["get"] == "engine_name":
            return {"result": "success", "return": "Test Engine"}
    return {"result": "error", "description": "unsupported"}

def main():
    while True:
        request = json.loads(input())
        print(json.dumps(process(request)))
        sys.stdout.flush()

if __name__ == '__main__':
    main()
