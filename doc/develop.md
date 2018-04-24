## Developer's Guide

### Content

- [General Organization](#general-organization)
- [Dependencies](#dependencies)

### General Organization

The main parts of this repository are listed below.

| Item                        | Type        | Description                            |
|:----------------------------|:------------|:---------------------------------------|
| [`index.htm`](../index.htm) | File (HTML) | Web application                        |
| [`backend`](../backend)     | Directory   | Back-end adapter and sample engines    |
| [`backend-b`](../backend-b) | Directory   | New (experimental) back-end adapter    |
| [`htm`](../htm)             | Directory   | Angular HTML templates                 |
| [`css`](../css)             | Directory   | Style files                            |
| [`js`](../js)               | Directory   | Javascript files                       |
| [`doc`](../doc)             | Directory   | Documentation                          |
| [`gates`](../gates)         | Directory   | _Digital Logic_ pack resources         |
| [`graphs`](../graphs)       | Directory   | _Graphs_ pack resources                |
| [`poets`](../poets)         | Directory   | _POETS_ pack resources                 |
| [`dev`](../dev)             | Directory   | Sub-projects in development or testing |

Javascript code inside `js` is divided into the following units:

| File                               | Description         |
|:-----------------------------------|:--------------------|
| [`vetrina.js`](../js/vetrina.js)   | Top-level module    |
| [`viewer.js`](../js/viewer.js)     | Diagram viewer      |
| [`terminal.js`](../js/terminal.js) | Command window      |
| [`sio.js`](../js/sio.js)           | WebSocket interface |
| [`bindings.js`](../js/bindings.js) | Keyboard bindings   |
| [`toaster.js`](../js/toaster.js)   | Toast renderer      |
| [`palette.js`](../js/palette.js)   | Command palette     |
| [`charts.js`](../js/charts.js)     | Charts interface    |
| [`demos.js`](../js/demos.js)       | Built-in demos      |

### Dependencies

Vertrina builds on the following web libraries:

- [AngularJS](https://angularjs.org/) (MVC)
- [Snap SVG](http://snapsvg.io/) (diagram editor)
- [Mousetrap](https://craig.is/killing/mice) (keyboard bindings)
- [Lodash](https://lodash.com/) (functional programming)
- [Socket.io](https://socket.io/) (WebSockets)
- [downloadjs](http://danml.com/download.html) (file downloads)
