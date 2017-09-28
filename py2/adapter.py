#!/usr/bin/env python

import io
import socketio
import eventlet
import eventlet.wsgi
import subprocess
import json
import flask

from termcolor import cprint
from datetime import datetime


def log_event(sid, str_, color):

    MAX_LEN = 80  # max chars per line
    mx_msg = MAX_LEN - 4  # max message length (subtracting length of " ...")

    tm = datetime.now().strftime('%I:%M:%S %p')

    str_short = ("%s ..." % str_[:mx_msg]) if len(str_)>mx_msg else str_
    sid_part = "(%s)" % sid[:8] if sid else ' '*10

    cprint("%s %s : %s" % (tm, sid_part, str_short), color)


def main():

    sio = socketio.Server()
    app = flask.Flask(__name__)
    app = socketio.Middleware(sio, app)

    # start engine

    proc = subprocess.Popen(["./engine1.py"],
        stdout=subprocess.PIPE,
        stdin=subprocess.PIPE,
        stderr=subprocess.STDOUT)

    # define message handler

    @sio.on('msg')
    def handle_message(sid, data):
        req_str = json.dumps(data)
        log_event(sid, req_str, "green")
        proc.stdin.write("%s\n" % req_str)
        rep_str = proc.stdout.readline().strip()
        log_event(sid, rep_str, "cyan")
        return json.loads(rep_str)

    # start server

    eventlet.wsgi.server(eventlet.listen(('localhost', 8000)), app)


if __name__ == '__main__':
    main()