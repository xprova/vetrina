## Protocol

Vetrina uses an asynchronous protocol to communicate with the back-end engine
(through the adapter). User interactions are sent as _request_ objects and
processed by the back-end engine which then sends one or more _response_
objects. Request and response objects are JSON dictionaries and the protocol
is _stateful_.

An example of this exchange is shown below.

```
07:29:00 PM (5591999b) : {'eval': '1+2', 'id': 4}
07:29:00 PM (5591999b) : {'result': 'success', 'return': '3\n'}
```

In this example, the user enters `1+2` in the command prompt. This interaction
is converted to an `eval` request object and sent to the back-end engine. The
engine replies with a response object indicating that the request has been
processed successfully and returns `'3\n'` which is appended to the command
window.

### Request Object Format

Each request object must be one of the following types:

#### 1. Call Object

- Used to call an engine function
- Must contain a `call` field with a string value (function name)
- May contain an `args` field with a JSON value (function arguments)

Examples:

```javascript
{'call': 'do_something'}
{'call': 'square', 'args': {'x': 5}}
```

#### 2. Set Object

- Used to set the value of an engine variable
- Must contain a `set` field with a string value (variable name)
- Must contain a `value` field with a JSON value (assigned value)

Examples:

```javascript
{'set': 'x', 'value': '1'}
{'set': 'y', 'value': {'first': 'John', 'last': 'doe'}}
```

#### 3. Get Object

- Used to get the value of an engine variable
- Must contain a `get` field with a string value (variable name)

Example:

```javascript
{'get': 'x'}
```

#### 4. Eval Object

- Used to evaluate an expression
- Must contain a `eval` field with a string value (expression to evaluate)

Example:

```javascript
{'eval': '1+2'}
```

### Response Object Format

Each request object must be one of the following types:

#### 1. Success Object

- Indicates that the request has been processed without errors
- Must contain a `result` field with the string value `success`
- Must contain a `return` field with a string value (returned output)

Example:

```javascript
{'result': 'success', 'return': '25'}
```

#### 2. Error Object

- Indicates that one or more errors were encountered when processing the request
- Must contain a `result` field with the string value `error`
- Must contain a `description` field with the string value (a description of encountered errors)

Examples:

```javascript
{'result': 'error', 'description': 'no such variable'}
{'result': 'error', 'description': '  File "<console>", line 1\n    hello world\n              ^\nSyntaxError: invalid syntax\n'}
```

#### 3. Update Object

- Indicates that some progress has been made in processing the request
- Must contain a `result` field with the string value `update`
- Must contain a `return` field with a string value (returned output)

Examples:

```javascript
{'result': 'update', 'return': '25% completed'}
{'result': 'update', 'return': '50% completed'}
{'result': 'update', 'return': '75% completed'}
```

Update objects sent in reply to a request object will overwrite each other in
the terminal window. In the above, the first update object will print `25%
completed` in the command window and the next two will overwrite this with
`50% completed` and `75% completed`.

By convention, a series of one or more update objects must be terminated by
either a success or error objects.

### Response Payload

Success response objects may also carry a _payload_ such as charts or files.

#### Charts

Charts are rendered using [Google
Charts](https://developers.google.com/chart/) inside the command window. To
create a new chart or update an existing one, the response object:

- Must contain a `type` field with the string value `chart`
- Must contain two subfields `data` and `options` in its `return` field

Example:

```javascript
{
    'result': 'success',
    'type': 'chart',
    'return': {
        'data': [
            ['Number of Cores', 'Performance'],
            [8, 12],
            [4, 5.5],
            [11, 14],
            [4, 5],
            [3, 3.5],
            [6.5, 7]
        ],
        'options': {
            'title': 'Average Shortest Path Computation',
            'hAxis': {'title': 'Number of Cores', 'minValue': 0, 'maxValue': 15},
            'vAxis': {'title': 'Performance (units)', 'minValue': 0, 'maxValue': 15},
            'legend': 'none'
        }
    }
}
```

At the moment, only area charts are supported. The `data` and `options` fields
are passed to Google Charts methods directly and their format is [documented
here](https://developers.google.com/chart/interactive/docs/gallery/areachart).

#### Files

Plain text files can be sent as response payloads and will be downloaded
automatically by the browser. To embed a file payload, the response object:

- Must contain a `type` field with the string value `file`
- Must contain two subfields `filename` and `content` in its `return` field.

```javascript
{
    'result': 'success',
    'type': 'file',
    'return': {
        'filename': 'results.csv',
        'content': 'a,b,c\n1,2,3\n4,5,6'
    }
}
```
