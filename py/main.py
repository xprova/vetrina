import socketio
import eventlet
import eventlet.wsgi
from flask import Flask, render_template

sio = socketio.Server()
app = Flask(__name__)

mods = [{"id": x, "name": "a" * x} for x in range(5)]


@app.route('/')
def index():
    """Serve the client-side application."""
    return render_template('index.html')


@sio.on('connect', namespace='/chat')
def connect(sid, environ):
    print("connect ", sid)
    sio.emit('msg', data="welcome from python", room=sid, namespace='/chat')


@sio.on('msg', namespace='/chat')
def message(sid, data):
    print("-----------------")
    print("message ", data)
    print("sid = %s" % sid)
    print("-----------------")
    sio.emit('msg', "hello from python", room=sid, namespace='/chat')
    sio.emit('data', mods, room=sid, namespace='/chat')
    return "thanks"


@sio.on('disconnect', namespace='/chat')
def disconnect(sid):
    print('disconnect ', sid)


def main():
    # wrap Flask application with engineio's middleware
    sapp = socketio.Middleware(sio, app)
    # deploy as an eventlet WSGI server
    eventlet.wsgi.server(eventlet.listen(('', 8000)), sapp)


if __name__ == '__main__':
    main()
