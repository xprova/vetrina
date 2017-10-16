## Vetrina

Generic EDA tool front-end based on web technologies, featuring a schematic
editor, a command palette and a console. The front-end can connect to a
back-end engine via WebSockets and expose its internal model and functionality
to the user.

[Live Demo](https://poets-project.org/editor/index.htm)

#### Mini Documentation

The protocol is evolving but here's a mini documentation of the way it
currently works.

The front and back-ends communicate by exchanging JSON objects. Each
communication consists of a request sent by the front-end and a corresponding
reply by the back-end. Below are some cookbook examples.

*Setting a variable:*
```javascript
{'set': 'p1', 'value': {'first': 'John', 'last': 'Doe', 'age': 30}}
{'result': 'success'}
```

*Getting a variable:*
```javascript
{'get': 'p1'}
{'result': 'success', 'return': {'first': 'John', 'last': 'Doe', 'age': 30}}
```

*Errors:*
```javascript
{'get': 'p2'}
{'result': 'error', 'description': 'no such variable'}
```

*Calls:*
```javascript
{'call': 'square', 'args': {'x': 5}}
{'result': 'success', 'return': 25}
```

*Evaluation:*
```javascript
{'eval': 'square(5)'}
{'result': 'success', 'return': '25\n'}
```

*Exceptions:*
```javascript
{'eval': 'hello world'}
{'result': 'exception', 'return': '  File "<console>", line 1\n    hello world\n              ^\nSyntaxError: invalid syntax\n'}
```

#### Notes

1. There's a subtle difference between errors and exceptions. *Errors*
indicate a problem with the request message (e.g. being in an incorrect
format, or getting a non-existing variable) while *exceptions* are problems
that occur while trying to generate a reply for a valid message (e.g. evaluate
1/0). Errors can occur for any message type while exceptions are only for eval
and call messages.

2. Another subtle difference is that between eval and call messages. Eval
returns any content printed to stdout plus the final expression value (all in
one string), while call returns the function result as an object.
