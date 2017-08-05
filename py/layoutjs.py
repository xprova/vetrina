#!/usr/bin/env python3

import os
import sys
import signal
import asyncio
import hashlib
import functools
from aiohttp import web
from socketio import AsyncServer
from datetime import datetime
from termcolor import cprint
from importlib import import_module
from importlib import invalidate_caches


def getFunctions(py_script):
    # loads the functions in the python script `py_script`
    # and returns a dict of funName -> fun
    parentDir, fileName = os.path.split(py_script)
    importName = fileName.replace(".py", "")
    sys.path.insert(0, parentDir)
    # importObj = __import__(importName)
    invalidate_caches()
    if importName in sys.modules:
        del sys.modules[importName]
    importObj = import_module(importName)
    funDict = {}
    for attr in dir(importObj):
        fun = getattr(importObj, attr)
        if callable(fun):
            funDict[attr] = fun
    return funDict["MyApp"]


def get_hash(file):
    with open(file, "rb") as fid:
        data = fid.read()
        return hashlib.md5(data).hexdigest()


def reloadmod(handler, file, current_hash, debug):
    hash_ = get_hash(file)
    if hash_ != current_hash:
        class_ = getFunctions(file)
        handler = class_()
        if debug:
            print("Detected change and reloaded %s" % file)
        return (handler, hash_)
    return (handler, hash_)


def setup_graceful_exit():
    loop = asyncio.get_event_loop()

    def ask_exit(signame):
        print("got signal %s: exit" % signame)
        loop.stop()

    for signame in ('SIGINT', 'SIGTERM'):
        loop.add_signal_handler(getattr(signal, signame),
                                functools.partial(ask_exit, signame))


def main():
    global handler
    global hash_
    debug = True
    py_file = sys.argv[1]
    handler, hash_ = reloadmod(None, py_file, None, False)
    sio = AsyncServer()
    app = web.Application()

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

    def reload_handler():
        global handler
        global hash_
        handler, hash_ = reloadmod(handler, py_file, hash_, debug)

    @sio.on('msg')
    async def message(sid, request):
        if debug:
            log_event(sid, str(request), "green")
        if "call" in request:
            reload_handler()
            kwargs = request.get("args") or {}
            if hasattr(handler, request["call"]):
                method = getattr(handler, request["call"])
                try:
                    response = method(**kwargs)
                except Exception as exp:
                    response = {"error": True, "description": str(exp)}
            else:
                response = {"error": True, "description": "no such method"}
        else:
            response = {"error": True, "description": "invalid request"}
        log_event(sid, response, "cyan")
        return response


    setup_graceful_exit()
    sio.attach(app)
    web.run_app(app, host='127.0.0.1', port=8000, print=(lambda _: None))


if __name__ == '__main__':
    main()
