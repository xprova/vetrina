#!/usr/bin/env python3

from aiohttp import web
from socketio import AsyncServer
import asyncio
import functools
import signal
from datetime import datetime
from termcolor import cprint


def run(handler, debug=True):

    loop = asyncio.get_event_loop()

    def ask_exit(signame):
        print("got signal %s: exit" % signame)
        loop.stop()

    for signame in ('SIGINT', 'SIGTERM'):
        loop.add_signal_handler(getattr(signal, signame),
                                functools.partial(ask_exit, signame))

    sio = AsyncServer()
    app = web.Application()
    sio.attach(app)

    def log_event(sid, str_, color):
        tm = datetime.now().strftime('%I:%M:%S %p')
        if sid:
            sid_short = sid[:8]
            cprint("%s (%s) : %s" % (tm, sid_short, str_), color)
        else:
            cprint("%s %s : %s" % (tm, ' ' * 10, str_), color)

    @sio.on('connect')
    def connect(sid, environ=None):
        if debug:
            log_event(sid, "connected", "grey")

    @sio.on('disconnect')
    def disconnect(sid, environ=None):
        if debug:
            log_event(sid, "disconnected", "grey")

    @sio.on('msg')
    async def message(sid, data):
        if debug:
            log_event(sid, str(data), "green")
        response = handler(data)
        log_event(sid, response, "cyan")
        return response

    web.run_app(app, host='127.0.0.1', port=8000, print=(lambda _: None))
