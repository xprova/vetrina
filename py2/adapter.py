#!/usr/bin/env python

import io
import socketio
import eventlet
import eventlet.wsgi
import subprocess
import json
import flask

from docopt import docopt
from datetime import datetime
from termcolor import cprint

usage="""Adapter

Usage:
  adapter.py <engine>

"""

def log_event(sid, str_, color):

    MAX_LEN = 80  # max chars per line
    mx_msg = MAX_LEN - 4  # max message length (subtracting length of " ...")

    tm = datetime.now().strftime('%I:%M:%S %p')

    str_short = ("%s ..." % str_[:mx_msg]) if len(str_)>mx_msg else str_
    sid_part = "(%s)" % sid[:8] if sid else ' '*10

    cprint("%s %s : %s" % (tm, sid_part, str_short), color)


def main():

    args = docopt(usage, version="Adapter 0.1")

    sio = socketio.Server()
    app = flask.Flask(__name__)
    app = socketio.Middleware(sio, app)

    # start engine

    try:

        proc = subprocess.Popen([args["<engine>"]],
            stdout=subprocess.PIPE,
            stdin=subprocess.PIPE,
            stderr=subprocess.STDOUT)

    except OSError as exp:

        msg = "Could not start engine: %s" % args["<engine>"]
        raise Exception(msg)

    # define message handler

    @sio.on('msg')
    def handle_message(sid, data):

        # log message and send to engine

        req_str = json.dumps(data)
        log_event(sid, req_str, "green")
        proc.stdin.write("%s\n" % req_str)

        # read and parse engine output

        rep_str = proc.stdout.readline().strip()
        log_event(sid, rep_str, "cyan")

        try:
            response = json.loads(rep_str)
        except ValueError:
            msg = "Engine returned an invalid JSON string"
            log_event(sid, msg, "red")
            response = {"result": "error", "description": "internal engine error"}

        return response

    # start server

    eventlet.wsgi.server(eventlet.listen(('localhost', 8000)), app)


if __name__ == '__main__':
    main()