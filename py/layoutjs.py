#!/usr/bin/env python3

import os
import sys
import socketio
import hashlib
from code import InteractiveConsole
from aiohttp import web
from datetime import datetime
from termcolor import cprint
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer


def log_event(debug, sid, str_, color):
    if debug:
        tm = datetime.now().strftime('%I:%M:%S %p')
        if sid:
            sid_short = sid[:8]
            cprint(f"{tm} ({sid_short}) : {str_}", color)
        else:
            sid_space = ' ' * 10
            cprint(f"{tm} {sid_soace} : {str_}", color)


class PythonConsole(InteractiveConsole):
    """Subclassed console that captures stdout

    adapted from https://stackoverflow.com/a/15311213
    """

    def __init__(self):
        InteractiveConsole.__init__(self)

    def write(self, data):
        self.runResult += data.rstrip()

    def push(self, expression):
        """Evaluate an expression"""
        sys.stdout = self
        self.runResult = ''
        InteractiveConsole.push(self, expression)
        sys.stdout = sys.__stdout__
        return self.runResult

    def eval(self, cmd):
        """Alias for push"""
        return self.push(cmd)

    def call(self, method, args=None):
        """Execute method and return results"""
        self.locals['mymethod'] = self.locals[method]
        if args:
            self.locals['myargs'] = args
            self.push("xx = mymethod(args)")
        else:
            self.push("xx = mymethod()")
        return self.locals['xx']

    def get(self, variable):
        return self.locals[variable]


class AppWatcher(FileSystemEventHandler):
    """
    Maintain an instance of the class defined in py_file and reload when
    py_file is changed
    """

    hash_ = None
    debug = False
    py_file = None
    console = None
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
            self.console = PythonConsole()
            py_mod = self.py_file.replace(".py", "")
            self.console.runcode(f'from {py_mod} import *')
            self.hash_ = new_hash
            if self.on_reload:
                self.on_reload()
            if self.debug:
                print(f"Detected change and reloaded <{self.py_file}>")


def get_error(description):
    return {
        "result": "error",
        "description": description
    }


def get_call_success(return_):
    return {
        "result": "success",
        "return": return_
    }


class MainNamespace(socketio.AsyncNamespace):
    """Handle sio messaging"""

    debug = False
    active_users = set()
    get_console = None

    def __init__(self, namespace, debug, get_console):
        super().__init__(namespace)
        self.debug = debug
        self.get_console = get_console

    def on_connect(self, sid, environ=None):
        self.active_users.add(sid)
        log_event(self.debug, sid, "connected", "grey")

    def on_disconnect(self, sid, environ=None):
        self.active_users.remove(sid)
        log_event(self.debug, sid, "disconnected", "grey")

    async def on_msg(self, sid, request):
        log_event(self.debug, sid, str(request), "green")
        console = self.get_console()
        if "call" in request:
            kwargs = request.get("args") or {}
            call_return = console.call(request["call"])
            response = {"result": "success", "return": call_return}
        elif "eval" in request:
            kwargs = request.get("args") or {}
            eval_result = console.eval(request["eval"])
            response = {"result": "success", "return": eval_result}
        elif "get" in request:
            kwargs = request.get("args") or {}
            value = console.get(request["get"])
            response = {"result": "success", "return": value}
        else:
            response = get_error("invalid request")
        log_event(self.debug, sid, response, "cyan")
        return response


def main():
    debug = True
    app = web.Application()
    sio = socketio.AsyncServer()
    app_watcher = AppWatcher(debug=True, py_file=sys.argv[1])
    get_console = lambda: app_watcher.console
    sio.register_namespace(MainNamespace("/", debug, get_console))
    sio.attach(app)
    web.run_app(app, host='127.0.0.1', port=8000, print=(lambda _: None),
                handle_signals=True)


if __name__ == '__main__':
    main()
