#!/usr/bin/env python

import io
import socketio
import subprocess
import json

from aiohttp import web
from socketio import AsyncServer

from docopt import docopt
from datetime import datetime
from termcolor import cprint

usage="""Adapter

Usage:
  adapter.py [options] <engine>

Options:
  -d, --debug  Print debug messages

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

    sio = AsyncServer()
    app = web.Application()
    sio.attach(app)

    # start engine

    try:

        proc = subprocess.Popen([args["<engine>"]],
            stdout=subprocess.PIPE,
            stdin=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            bufsize=1)

    except OSError as exp:

        msg = "Could not start engine: %s" % args["<engine>"]
        raise Exception(msg)

    # define message handler

    @sio.on('msg')
    async def handle_message(sid, data):

        # log message and send to engine

        req_str = json.dumps(data)
        log_event(sid, req_str, "green")
        proc.stdin.write("%s\n" % req_str)

        # read, log and parse engine output

        try:

            unfinished = True

            while unfinished:
                rep_str = proc.stdout.readline().strip()
                response = json.loads(rep_str)
                unfinished = response.get("result") not in ["success", "error"]
                color = "yellow" if unfinished else "cyan"
                log_event(sid, rep_str, color)
                await sio.emit('reply', response)

                # For some reason, the reply message is not sent until the
                # next await statement. As a workaround, send a dummy message.
                # TODO: fix
                await sio.emit('dummy')

        except ValueError:
            log_event(sid, "Engine returned an invalid JSON string: " + rep_str, "red")
            response = {
                "result": "error",
                "description": "internal engine error"
            }
            await sio.emit('reply', response)

    # start server

    web.run_app(app, port=9020)


if __name__ == '__main__':
    main()