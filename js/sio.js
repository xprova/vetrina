sio = (function () {

	'use strict';

	const debug = true;

	const tm = () => new Date().toLocaleTimeString();

	var socket = io("http://localhost:8000/");

	const log = (msg) => console.log(`${tm()} :: ${msg}`)

	function send(content, callback) {
		socket.emit('msg', content, (result) => {
			if (debug) console.log(result);
			if (callback != null) callback(result);
		});
	}

	function call(method, args={}, callback) {
		send({call: method, args:args}, callback);
	}

	socket.on('connect', () => {
		if (debug) log('connected');
	});

	socket.on('disconnect', () => {
		if (debug) log('disconnected');
	});

	return {send, call};

})();
