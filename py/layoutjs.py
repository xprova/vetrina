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
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer


def get_class(py_script):
    """Return a class from a python file"""
    # get module name from filename
    parentDir, fileName = os.path.split(py_script)
    importName = fileName.replace(".py", "")
    sys.path.insert(0, parentDir)
    # clear cache and import module
    invalidate_caches()
    if importName in sys.modules:
        del sys.modules[importName]
    mod = import_module(importName)
    # get classes
    objs = [getattr(mod, obj_name) for obj_name in dir(mod)]
    classes = [obj for obj in objs if isinstance(obj, type)]
    if not classes:
        raise Exception("Did not find any new-style classes in %s" % py_script)
    if len(classes)>1:
        print("Found multiple classes in %s, using class <%s>" %
              (py_script, classes[0].__name__))
    return classes[0]


def log_event(sid, str_, color):
    tm = datetime.now().strftime('%I:%M:%S %p')
    if sid:
        sid_short = sid[:8]
        cprint("%s (%s) : %s" % (tm, sid_short, str_), color)
    else:
        cprint("%s %s : %s" % (tm, ' ' * 10, str_), color)


class AppWatcher(FileSystemEventHandler):

    hash_ = None
    debug = False
    py_file = None
    instance = None
    on_reload = None

    def __init__(self, debug, py_file, watch_dir='.', on_reload=None):
        self.py_file = py_file
        self.on_modified(None)
        self.debug = debug
        self.on_reload = on_reload
        observer = Observer()
        observer.schedule(self, watch_dir, recursive=True)
        observer.start()

    def get_py_file_hash(self):
        with open(self.py_file, "rb") as fid:
            data = fid.read()
            return hashlib.md5(data).hexdigest()

    def on_modified(self, event):
        new_hash = self.get_py_file_hash()
        if new_hash != self.hash_:
            class_ = get_class(self.py_file)
            self.instance = class_()
            self.hash_ = new_hash
            if self.on_reload:
                self.on_reload()
            if self.debug:
                print(f"Detected change in <{self.py_file}>, "
                      f"reloading <{class_.__name__}> instance")


class MainNamespace(socketio.AsyncNamespace):

    debug = False
    active_users = set()
    get_app_instance = None

    def __init__(self, namespace, debug, get_app_instance):
        super().__init__(namespace)
        self.debug = debug
        self.get_app_instance = get_app_instance

    def on_connect(self, sid, environ=None):
        self.active_users.add(sid)
        if self.debug:
            log_event(sid, "connected", "grey")

    def on_disconnect(self, sid, environ=None):
        self.active_users.remove(sid)
        if self.debug:
            log_event(sid, "disconnected", "grey")

    async def on_msg(self, sid, request):
        if self.debug:
            log_event(sid, str(request), "green")
        if "call" in request:
            kwargs = request.get("args") or {}
            app_instance = self.get_app_instance()
            if hasattr(app_instance, request["call"]):
                method = getattr(app_instance, request["call"])
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


def main():
    debug = True
    app = web.Application()
    sio = socketio.AsyncServer()
    app_watcher = AppWatcher(debug=True, py_file=sys.argv[1])
    get_app_instance = lambda : app_watcher.instance
    sio.register_namespace(MainNamespace("/", debug, get_app_instance))
    sio.attach(app)
    web.run_app(app, host='127.0.0.1', port=8000, print=(lambda _: None),
                handle_signals=True)


if __name__ == '__main__':
    main()
