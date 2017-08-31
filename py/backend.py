#!/usr/bin/env python3

import os
import sys
import socketio
from code import InteractiveConsole
from aiohttp import web
from datetime import datetime
from termcolor import cprint
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer


def log_event(debug, sid, str_, color):
    if debug:
        tm = datetime.now().strftime('%I:%M:%S %p')
        str_short = f"{str_[:76]} ..." if len(str_)>76 else str_
        if sid:
            sid_short = sid[:8]
            cprint(f"{tm} ({sid_short}) : {str_short}", color)
        else:
            sid_space = ' ' * 10
            cprint(f"{tm} {sid_soace} : {str_short}", color)


class PythonConsole(InteractiveConsole):
    """Subclassed console that captures stdout

    adapted from https://stackoverflow.com/a/15311213
    """

    def __init__(self):
        InteractiveConsole.__init__(self)

    def write(self, data):
        self.runResult += data

    def showtraceback(self):
        self.exception_happened = True
        InteractiveConsole.showtraceback(self)

    def showsyntaxerror(self, filename=None):
        self.exception_happened = True
        InteractiveConsole.showsyntaxerror(self, filename)

    def push(self, expression):
        """Evaluate an expression"""
        self.exception_happened = False
        sys.stdout = self
        self.runResult = ''
        InteractiveConsole.push(self, expression)
        sys.stdout = sys.__stdout__
        return self.runResult

    def eval(self, cmd):
        """Alias for push"""
        return self.push(cmd)

    def call(self, method, kwargs={}):
        """Execute method and return results"""
        return self.locals[method](**kwargs)

    def get(self, variable):
        return self.locals[variable]

    def set(self, variable, value):
        self.locals[variable] = value

    def import_module(self, py_mod, symbols):
        lines = [
            f'import sys',
            f'if "{py_mod}" in sys.modules:'
            f'    del sys.modules["{py_mod}"]',
            f'from {py_mod} import {symbols}',
        ]
        for line in lines:
            self.runcode(line)


class AppWatcher(FileSystemEventHandler):
    """
    Watch a directory and run on_reload when changes in .py files are detected
    """

    def __init__(self, on_reload, watch_dir='.'):
        self.on_reload = on_reload
        observer = Observer()
        observer.schedule(self, watch_dir, recursive=True)
        observer.start()

    def on_modified(self, event):
        if event and event.src_path[-3:] == ".py":
            self.on_reload()


class MainNamespace(socketio.AsyncNamespace):
    """Handle sio messaging"""

    debug = False
    active_users = set()
    console = None
    model_id = None  # keeps id(model) of last update to detect changes

    def __init__(self, namespace, debug, console):
        super().__init__(namespace)
        self.debug = debug
        self.console = console

    def on_connect(self, sid, environ=None):
        self.active_users.add(sid)
        log_event(self.debug, sid, "connected", "grey")

    def on_disconnect(self, sid, environ=None):
        self.active_users.remove(sid)
        log_event(self.debug, sid, "disconnected", "grey")

    def handle_call(self, request):
        kwargs = request.get("args") or {}
        call_return = self.console.call(request["call"], kwargs)
        return {"result": "success", "return": call_return}

    def handle_eval(self, request):
        kwargs = request.get("args") or {}
        eval_result = self.console.eval(request["eval"])
        if self.console.exception_happened:
            return {"result": "exception", "return": eval_result}
        else:
            response = {
                "result": "success",
                "return": eval_result,
            }
            model = self.console.locals.get("model")
            # detect changes or re-assignment of model
            if model.dirty or self.model_id != id(model):
                model.dirty = False
                self.model_id = id(model)
                response["state"] = {
                    "modules": model.modules,
                    "connections": model.connections,
                }
            return response

    def handle_get(self, request):
        try:
            kwargs = request.get("args") or {}
            value = self.console.get(request["get"])
            return {"result": "success", "return": value}
        except KeyError:
            return {"result": "error", "description": "no such variable"}

    def handle_set(self, request):
        try:
            variable = request["set"]
            value = request["value"]
            self.console.set(variable, value)
            return {"result": "success"}
        except KeyError:
            return {"result": "error", "description": "could not set variable"}

    async def on_msg(self, sid, request):
        log_event(self.debug, sid, str(request), "green")
        call_table = {
            "call": self.handle_call,
            "eval": self.handle_eval,
            "get" : self.handle_get,
            "set" : self.handle_set,
        }
        for call_type, handle_func in call_table.items():
            if call_type in request:
                response = handle_func(request)
                log_event(self.debug, sid, str(response), "cyan")
                return response
        else:
            return {"result": "error", "description": "invalid request"}

def load_engine(console, py_mod, debug):
    console.import_module("model", "Model")
    console.runcode("init = lambda: Model()")  # define a dummy init()
    if py_mod:
        console.import_module(py_mod, "*")
    if debug:
        print(f"Detected change and reloaded engine")

def main():
    debug = True
    py_file = sys.argv[1] if len(sys.argv)>1 else None
    py_mod = py_file.replace(".py", "") if py_file else None
    app = web.Application()
    sio = socketio.AsyncServer()
    console = PythonConsole()
    app_watcher = AppWatcher(lambda: load_engine(console, py_mod, debug))
    load_engine(console, py_mod, False)
    sio.register_namespace(MainNamespace("/", debug, console))
    sio.attach(app)
    print("Server started")
    web.run_app(app, host='127.0.0.1', port=8000, print=(lambda _: None),
                handle_signals=True)

if __name__ == '__main__':
    main()
