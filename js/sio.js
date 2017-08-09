sio = (function () {

	'use strict';

	const debug = true;

	const tm = () => new Date().toLocaleTimeString();

	var socket = io("http://localhost:8000/");

	const log = (msg) => console.log(`${tm()} :: ${msg}`)

	var connected = false;

	function send(content, callback) {
		socket.emit('msg', content, (result) => {
			if (debug) console.log(result);
			if (callback != null) callback(result);
		});
	}

	function call(method, args={}, callback) {
		if (connected)
			send({call: method, args:args}, callback);
		else
			callback({"result": "error", "description": "no engine connected"})
	}

	socket.on('connect', () => {
		connected = true;
		if (debug) log('connected');
		call("count");
	});

	socket.on('disconnect', () => {
		connected = false;
		if (debug) log('disconnected');
	});

	return {send, call};

})();
