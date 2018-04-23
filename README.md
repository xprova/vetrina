## Vetrina

### Content

- [Overview](#overview)
- [Setup](#setup)
- [Protocol](#protocol)
    - [Request Object Format](#request-object-format)
    - [Response Object Format](#response-object-format)

### Overview

Vetrina is a modern web-based front-end for interactive command line tools,
consisting of a diagram editor and a console. It connects to server-side tools
(_backend engines_) via
[WebSockets](https://en.m.wikipedia.org/wiki/WebSocket) and allows users to
interact with them through web browsers.

Vetrina makes it very easy to covert basic command line tools in any language
into full-fledged visual experiences and expose them to users on the Internet.

[Live Demo](https://tuura.org/vetrina/?demo)

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

#### Connectivity

Vetrina uses port 9020 for the WebSocket connection. The web application will
persist in attempting to connect until a connection is made so there's no need
to restart either the adapter or web application if the connection is dropped
(and they can be started in any order). The connection is negotiated using
HTTPS, unless Vetrina is running locally (i.e. if hostname is `localhost`) in
which case it will use HTTP.

### Protocol

Vetrina uses an asynchronous protocol to communicate with the back-end engine
(through the adapter). User interactions are sent as _request_ objects and
processed by the back-end engine which then sends one or more _response_
objects. Request and response objects are JSON dictionaries.

An example of this exchange is shown below.

```
07:29:00 PM (5591999b) : {'eval': '1+2', 'id': 4}
07:29:00 PM (5591999b) : {'result': 'success', 'return': '3\n'}
```

In this example, the user enters `1+2` in the command prompt. This interaction
is converted to an `eval` request object and sent to the back-end engine (more
on message format in a bit). The engine replies with a response object
indicating that the request has been processed successfully and returns
`'3\n'` which is appended the command window.

#### Request Object Format

Each request object must be one of the following types:

##### 1. Call object

- Used to call an engine function
- Must contain a `call` field with a string value (function name)
- May contain an `args` field with a JSON value (function arguments)

Examples:

```javascript
{'call': 'do_something'}
{'call': 'square', 'args': {'x': 5}}
```

##### 2. Set object

- Used to set the value of an engine variable
- Must contain a `set` field with a string value (variable name)
- Must contain a `value` field with a JSON value (assigned value)

Examples:

```javascript
{'set': 'x', 'value': '1'}
{'set': 'y', 'value': {'first': 'John', 'last': 'doe'}}
```

##### 3. Get object

- Used to get the value of an engine variable
- Must contain a `get` field with a string value (variable name)

Example:

```javascript
{'get': 'x'}
```

##### 4. Eval object

- Used to evaluate an expression
- Must contain a `eval` field with a string value (expression to evaluate)

Example:

```javascript
{'eval': '1+2'}
```

#### Response Object Format

Each request object must be one of the following types:

##### 1. Success object

- Indicates that the request has been processed without errors
- Must contain a `result` field with the string value `success`
- Must contain a `return` field with a string value (returned output)

Example:

```javascript
{'result': 'success', 'return': '25'}
```

##### 2. Error object

- Indicates that one or more errors were encountered when processing the request
- Must contain a `result` field with the string value `error`
- Must contain a `description` field with the string value (a description of encountered errors)

Examples:

```javascript
{'result': 'error', 'description': 'no such variable'}
{'result': 'error', 'description': '  File "<console>", line 1\n    hello world\n              ^\nSyntaxError: invalid syntax\n'}
```

##### 3. Update object

- Indicates that some progress has been made in processing the request
- Must contain a `result` field with the string value `update`
