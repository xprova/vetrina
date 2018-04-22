## Vetrina

Vetrina is a modern web-based front-end for interactive command line tools,
consisting of a diagram editor and a console. It connects to server-side tools
(_backend engines_) via
[WebSockets](https://en.m.wikipedia.org/wiki/WebSocket) and allows users to
interact with them through web browsers.

Vetrina makes it very easy to covert basic command line tools in any language
into full-fledged visual experiences and expose them to users on the Internet.

[Live Demo](https://tuura.org/vetrina/?demo)

### Overview

<img src="svg/overview.svg" width="100%">

Vetrina consists of two parts: a web application and a back-end adapter.

The web application ([`index.htm`](index.htm)) is an Angular-based interactive
diagram editor with built-in console that converts user interactions into JSON
objects and sends them through a WebSocket connection to the back-end adapter
([`py2/adapter.py`](py2/adapter.py)). The latter maintains the server-side end
of the WebSocket connection, relaying received JSON objects to a back-end
engine and sends engine replies back to the web application. Communication
between the adapter and engine are done purely using input/output streams,
making it very simple to develop engines in any language (including Bash, see
[this example](py2/engine_hello.sh)).

### Setup

#### Web Application

The web application can be served as a static website using any standard
webserver, using the top-level [`index.htm`](index.htm) file.

#### Back-end Engine

The back-end engine must be invoked through the adapter as follows:

```
./adapter.py ./engine
```

The engine name argument must be in the same format used to execute the engine
in the Linux shell. For example, an engine in the current directory must be
invoked as `./adapter.py ./engine` (`./adapter.py engine` will throw an error
message).

The adapter will start the engine as a subprocess and relay its input and
output streams to the WebSocket connection. It will also print a time-stamped
log of incoming and outgoing messages as below:

```
Server started
07:28:55 PM (5591999b) : connected
07:28:55 PM (5591999b) : {'get': 'engine_name', 'id': 2}
07:28:55 PM (5591999b) : {'result': 'success', 'return': 'Graphs'}
07:28:55 PM (5591999b) : {'eval': 'model = init()', 'id': 3}
07:28:55 PM (5591999b) : {'result': 'success', 'return': '', 'state': {'modules': [{'id': 'n0', 'x':  ...
07:29:00 PM (5591999b) : {'eval': '1+2', 'id': 4}
07:29:00 PM (5591999b) : {'result': 'success', 'return': '3\n'}
07:29:13 PM (5591999b) : {'eval': 'x = list(range(10))', 'id': 5}
07:29:13 PM (5591999b) : {'result': 'success', 'return': ''}
07:29:13 PM (5591999b) : {'eval': 'x', 'id': 6}
07:29:13 PM (5591999b) : {'result': 'success', 'return': '[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]\n'}
07:32:22 PM (5591999b) : {'eval': 'init', 'id': 7}
07:32:22 PM (5591999b) : {'result': 'success', 'return': '<function init at 0x6fffe635d08>\n', 'state ...
```

(`5591999b` is the client's identifier in this log)

In practice, more robust mechanisms such as setting up
[systemd units](https://www.digitalocean.com/community/tutorials/understanding-systemd-units-and-unit-files)
may be preferable to ensure that the engine is ran at system startup and restarted if it fails.
