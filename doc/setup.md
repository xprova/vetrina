## Setup

### Web Application

The web application can be served as a static website using any standard
webserver, using the top-level [`index.htm`](index.htm) file. The
[Browsesync](https://www.browsersync.io/) configuration file
[`bs-config.js`](bs-config.js) is provided for convenience during development.

Vetrina can also be ran as an independent application using
[Electron](https://electronjs.org/):

```
electron /path/to/vetrina
```

### Back-end Engine

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

### Connectivity

Vetrina uses port 9020 for the WebSocket connection. The web application will
persist in attempting to connect until a connection is made so there's no need
to restart either the adapter or web application if the connection is dropped
(and they can be started in any order). The connection is negotiated using
HTTPS, unless Vetrina is running locally (i.e. if hostname is `localhost`) in
which case it will use HTTP.