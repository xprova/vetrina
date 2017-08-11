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
		callback = callback || (() => null);
		if (connected)
			socket.emit('msg', content, (result) => callback(result));
		else
			callback({"result": "error", "description": "no engine connected"});
	}

	function call(method, args={}, callback) {
		send({call: method, args:args}, callback);
	}

	function evaluate(method, callback) {
		send({eval: method}, callback);
	}

	function get(variable, callback) {
		send({get: variable}, callback);
	}

	return {connect, call, evaluate, get};

})();
