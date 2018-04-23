## Viewer State

This document describes the object model of Vetrina's diagram editor.

The content of the editor are represented by _module_ and _connection_
objects. These are maintained by the back-end engine and sent to the web
application after interactions that cause viewer state updates. For example,
if the user issues a clear command, the back-end engine must re-compute module
and connection objects (clear them in this case) and send the updated state
back to the web application for rendering. For a protocol-level discussion of
this process, see [Viewer State Response Payloads](https://github.com/xprova/vetrina/blob/master/doc/protocol.md#files).

### Module Objects

Modules are JSON dictionaries rendered as styled rectangles with optional
labels and pins. The diagram editor is an SVG element underwhich modules are
represented as `g` (group) elements. Example entities that can be rendered as
modules include logic gates and graph nodes.

Each module consists of the following fields:

Field           | Value type                  | Description
--------        | --------------------------- | -----------
`id`            | String                      | Unique identifier
`width`         | Number                      | Width (pixels)
`height`        | Number                      | Height (pixels)
`x`             | Number                      | X-coordinate relative to diagram center (pixels)
`y`             | Number                      | Y-coordinate relative to diagram center (pixels)
`class`         | String                      | Module type (added to the list of classes of the module's `g` element)
`classes`       | List (of Strings)           | Additional classes to add to the module's top `g` (for styling purposes)
`ports`         | Dictionary (String -> Port) | Dictionary of port objects
`border-radius` | Number                      | Border radius of body rectangle
`svg`           | String                      | SVG icon (loaded from the web application's directory)

where a _Port_ object is a dictionary with a field `position` having one of
the string values `left`, `right`, `top` or `bottom`.

As an example, here is a module object:

 ```javascript
 {
    'id': 'gate1',
    'width': 200,
    'height': 200,
    'x': 0,
    'y': 0,
    'class': 'logic-gates',
    'classes': ['cmos', 'animated', 'hide-label'],
    'ports': {
        'a': {
            'position': 'left'
        },
        'b': {
            'position': 'left'
        },
        'y': {
            'position': 'right'
        }
    },
    'border-radius': 5
 }
 ```

### Connection Objects

Connection objects are tuples (Javascript lists) in the form

```javascript
[src_mod, dst_mod, src_port, dst_port, classes]
```

where `src_mod`, `dst_mod` are the source and destination modules of the
connection, `src_port`, `dst_port` are the respective source and destination
ports and `classes` is a list of classes for styling.
