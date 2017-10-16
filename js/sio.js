sio = (function () {

	'use strict';

	const debug = true;
	const tm = () => new Date().toLocaleTimeString();
	const log = (msg) => console.log(`${tm()} :: ${msg}`)

	var socket;
	var connected = false;

	var msg_counter = 0;

	var finish_cb_table = {};  // call id -> finish_cb_fun
	var update_cb_table = {};  // call id -> update_cb_fun

	var last_finish_cb;
	var last_update_cb;

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

		socket.on('reply', (content) => {
			var callback = finish_cb_table[content._id] || last_finish_cb;
			callback(content);
		});

	}

	function send(content, finish_cb, update_cb) {

		if (connected) {

			var id = msg_counter++;
			content["id"] = id; // TODO: deep copy instead of mutation
			finish_cb_table[id] = finish_cb;
			update_cb_table[id] = update_cb;
			socket.emit('msg', content);

			last_finish_cb = finish_cb;
			last_update_cb = update_cb;

		} else {

			finish_cb({"result": "error", "description": "no engine connected"});

		}
	}

	function call(method, args={}, finish_cb, update_cb) {
		send({call: method, args:args}, finish_cb, update_cb);
	}

	function evaluate(method, finish_cb, update_cb) {
		send({eval: method}, finish_cb, update_cb);
	}

	function get(variable, finish_cb, update_cb) {
		send({get: variable}, finish_cb, update_cb);
	}

	function set(variable, value, finish_cb, update_cb) {
		send({set: variable, value:value}, finish_cb, update_cb);
	}

	return {connect, call, evaluate, get, set};

})();
