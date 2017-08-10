sio = (function () {

	'use strict';

	const debug = true;
	const tm = () => new Date().toLocaleTimeString();
	const log = (msg) => console.log(`${tm()} :: ${msg}`)

	var socket;
	var connected = false;

	function connect(connect_cb, disconnect_cb) {

		socket = io("http://localhost:8000/");

		socket.on('connect', () => {
			connected = true;
			if (debug) log('connected');
			if (connect_cb) connect_cb();
		});

		socket.on('disconnect', () => {
			connected = false;
			if (debug) log('disconnected');
			if (disconnect_cb) disconnect_cb();
		});

	}

	function send(content, callback) {
		if (connected) {
			socket.emit('msg', content, (result) => {
				if (callback != null) callback(result);
			});
		} else {
			console.error('cannot send while disconnected')
		}
	}

	function call(method, args={}, callback) {
		if (connected)
			send({call: method, args:args}, callback);
		else
			callback({"result": "error", "description": "no engine connected"})
	}

	return {connect, call};

})();
