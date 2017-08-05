#!/usr/bin/env python3

from aiohttp import web
from socketio import AsyncServer
import asyncio
import functools
import signal
from datetime import datetime


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

    def log_event(sid, str_):
        tm = datetime.now().strftime('%I:%M:%S %p')
        if sid:
            sid_short = sid[:8]
            print("%s (%s) : %s" % (tm, sid_short, str_))
        else:
            print("%s %s : %s" % (tm, ' ' * 10, str_))

    @sio.on('connect')
    def connect(sid, environ):
        if debug:
            log_event(sid, "connected")

    @sio.on('disconnect')
    def disconnect(sid, environ):
        if debug:
            log_event(sid, "disconnected")

    @sio.on('msg')
    async def message(sid, data):
        if debug:
            log_event(sid, str(data))
        response = handler(data)
        log_event(sid, response)
        return response

    web.run_app(app, host='127.0.0.1', port=8000, print=(lambda _: None))
