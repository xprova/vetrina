#!/usr/bin/env python3

import os
import sys
import socketio
import hashlib
from aiohttp import web
from datetime import datetime
from termcolor import cprint
from importlib import import_module
from importlib import invalidate_caches

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler


class FileChangeHandler(FileSystemEventHandler):

    debug = False

    def on_reload():
        pass

    def __init__(self, debug, on_reload):
        global hash_
        global handler
        hash_ = None
        handler = None
        self.on_modified(None)
        self.debug = debug
        self.on_reload = on_reload

    def on_modified(self, event):
        global handler
        global hash_
        file = sys.argv[1]
        new_hash = get_hash(file)
        if new_hash != hash_:
            class_ = getFunctions(file)
            handler = class_()
            hash_ = new_hash
            if self.debug:
                print("Detected change and reloaded %s" % file)


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

def main():
    debug = True
    sio = socketio.AsyncServer()
    app = web.Application()
    active_users = set()

    def log_event(sid, str_, color):
        tm = datetime.now().strftime('%I:%M:%S %p')
        if sid:
            sid_short = sid[:8]
            cprint("%s (%s) : %s" % (tm, sid_short, str_), color)
        else:
            cprint("%s %s : %s" % (tm, ' ' * 10, str_), color)

    @sio.on('connect')
    def connect(sid, environ=None):
        active_users.add(sid)
        if debug:
            log_event(sid, "connected", "grey")

    @sio.on('disconnect')
    def disconnect(sid, environ=None):
        active_users.remove(sid)
        if debug:
            log_event(sid, "disconnected", "grey")


    @sio.on('msg')
    async def message(sid, request):
        if debug:
            log_event(sid, str(request), "green")
        if "call" in request:
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

    def on_reload():
        pass

    observer = Observer()
    change_handler = FileChangeHandler(debug=debug, on_reload=on_reload)
    change_handler.on_modified(None)
    observer.schedule(change_handler, '.', recursive=True)
    observer.start()

    sio.attach(app)
    web.run_app(app, host='127.0.0.1', port=8000, print=(lambda _: None),
                handle_signals=True)


if __name__ == '__main__':
    main()
