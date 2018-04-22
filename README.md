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
objects and sends them through a WebSocket connection to the back-end adapter.
The latter maintains the server-side end of the WebSocket connection, relaying
received JSON objects to a back-end engine and sending engine replies back to
the web application. Communication between the adapter and engine are done
purely using input/output streams, making it very simple to develop engines in
any language (including Bash scripts, see
[py2/engine_hello.sh](py2/engine_hello.sh)).
