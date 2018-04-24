const demos = (function () {

	'use strict';

	const gate_nodes = [
	    ["n3",    "0.375",   "8.8889",  gateSource],
	    ["n5",    "0.375",   "6.7361",  gateSource],
	    ["n6",    "0.375",   "4.5417",  gateSource],
	    ["n11",   "0.375",   "3.4444",  gateSource],
	    ["n15",   "0.375",   "7.9861",  gateSource],
	    ["n16",   "0.375",   "5.8333",  gateSource],
	    ["n22",   "0.375",   "1.0278",  gateSource],
	    ["n24",   "0.375",   "2.4306",  gateSource],
	    ["n3b",   "13.625",  "8.5",     gateSink],
	    ["n5b",   "13.625",  "5.875",   gateSink],
	    ["n6b",   "13.625",  "3.5556",  gateSink],
	    ["n11b",  "13.625",  "2.3889",  gateSink],
	    ["n15b",  "13.625",  "7.0417",  gateSink],
	    ["n16b",  "13.625",  "4.7222",  gateSink],
	    ["n22b",  "13.625",  "0.375",   gateSink],
	    ["n24b",  "13.625",  "1.2222",  gateSink],
	    ["n1",    "10.75",   "8.125",   gateAnd],
	    ["n2",    "4.75",    "2.3889",  gateXor],
	    ["n4",    "12.25",   "0.375",   gateXor],
	    ["n7",    "9.25",    "6.9583",  gateAnd],
	    ["n8",    "6.25",    "3.5556",  gateXor],
	    ["n9",    "6.25",    "4.6389",  gateAnd],
	    ["n10",   "3.25",    "2.3056",  gateAnd],
	    ["n12",   "7.75",    "5.7917",  gateAnd],
	    ["n13",   "4.75",    "3.4722",  gateAnd],
	    ["n17",   "7.75",    "4.7222",  gateXor],
	    ["n18",   "12.25",   "8.5",     gateXor],
	    ["n19",   "3.25",    "1.2222",  gateXor],
	    ["n20",   "1.75",    "1.6667",  gateAnd],
	    ["n21",   "9.25",    "5.875",   gateXor],
	    ["n23",   "10.75",   "7.0417",  gateXor]
	]

	const gate_connections = [
	    ["n3", "n18", "y", "a"],
	    ["n4", "n22b", "y", "a"],
	    ["n6", "n8", "y", "a"],
	    ["n6", "n9", "y", "a"],
	    ["n7", "n1", "y", "a"],
	    ["n7", "n23", "y", "a"],
	    ["n8", "n6b", "y", "a"],
	    ["n9", "n12", "y", "a"],
	    ["n9", "n17", "y", "a"],
	    ["n12", "n7", "y", "a"],
	    ["n12", "n21", "y", "a"],
	    ["n16", "n12", "y", "a"],
	    ["n16", "n17", "y", "a"],
	    ["n17", "n16b", "y", "a"],
	    ["n18", "n3b", "y", "a"],
	    ["n23", "n15b", "y", "a"],
	    ["n1", "n18", "y", "a"],
	    ["n2", "n11b", "y", "a"],
	    ["n5", "n7", "y", "a"],
	    ["n5", "n21", "y", "a"],
	    ["n10", "n13", "y", "a"],
	    ["n10", "n2", "y", "a"],
	    ["n11", "n13", "y", "a"],
	    ["n11", "n2", "y", "a"],
	    ["n13", "n8", "y", "a"],
	    ["n13", "n9", "y", "a"],
	    ["n15", "n1", "y", "a"],
	    ["n15", "n23", "y", "a"],
	    ["n19", "n24b", "y", "a"],
	    ["n20", "n19", "y", "a"],
	    ["n20", "n10", "y", "a"],
	    ["n21", "n5b", "y", "a"],
	    ["n22", "n4", "y", "a"],
	    ["n22", "n20", "y", "a"],
	    ["n24", "n19", "y", "a"],
	    ["n24", "n10", "y", "a"]
	]

	function product (a, b, ...c) {
	    // https://stackoverflow.com/a/43053803
	    function cartesian_f (a, b) {
	        return [].concat(...a.map(a => b.map(b => [].concat(a, b))));
	    }
	    return b ? product(cartesian_f(a, b), ...c) : a;
	}

	function get_module_grid(template, id_) {

	    var mod_tups = product(_.range(5), _.range(5));

	    const makeMod = function (mod_tup) {

	        var [i, j] = mod_tup;

	        var id = `${id_}_${i}_${j}`;

	        return makeGate(template, {id: id, x: 200 * i + 200, y: 200 * j});
	    }

	    return _.map(mod_tups, makeMod);
	}

	function makeGate(template, attrs = {}) {

	    return _.chain(template).cloneDeep().extend(attrs).value();
	}

	function get_poets() {

	    const grid_modules = get_module_grid(corePOETS, "corePOETS");

	    const [dx, dy, s] = [50, 25, 5];

	    const misc_modules = [
	        makeGate(gateAnd, {x: -dx, y:+dy, id: "gate1"}),
	        makeGate(gateAnd, {x: -dx, y:-dy, id: "gate2"}),
	        makeGate(gateAnd, {x:0, y:0, id: "gate3"}),
	        makeGate(gateInverter, {x:dx, y:0, id: "gate4"}),
	        makeGate(norGate, {x: 400, y:-200, id: "block1"}),
	    ];

	    const misc_connections = [
	        ["gate1", "gate3", "y", "a"],
	        ["gate2", "gate3", "y", "b"],
	        ["gate3", "gate4", "y", "a"],
	        ["gate4", "corePOETS_0_0", "y", "E"],
	        ["corePOETS_0_0", "corePOETS_1_1", "E", "W"],
	        ["corePOETS_1_1", "corePOETS_2_0", "E", "W"],
	        ["corePOETS_1_1", "corePOETS_2_2", "E", "W"],
	        ["corePOETS_0_0", "block1", "N", "a"]
	    ];

	    const gate_modules = _.map(gate_nodes, function (node) {

	        const [id_, x, y, gateTemplate] = node;

	        const [nx, ny] = _.map([x, y], x => Math.round(x * s)/ s * 60);

	        return makeGate(gateTemplate, {x: nx - 1000, y:ny, id: id_});

	    });

	    const modules = _.concat(grid_modules, misc_modules, gate_modules);
	    const connections = _.concat(misc_connections, gate_connections);

	    return {modules, connections};
	}

	function get_graph() {

		const count = 36; // number of nodes
		const edges = 100; // number of edges

		function make_node(index) {

			const radians = 1.0 * index / count * 2.0 * Math.PI;
			const radius = 200;
			const x = Math.sin(radians) * radius;
			const y = Math.cos(radians) * radius;

			return {
				"id": `n${index}`,
				"x": x,
				"y": y,
				"description": "Graph Node",
				"class": "node",
				"classes": ["graph", "hide-label"],
				"border-radius": 10,
				"width": 20,
				"height": 20,
				"ports": {
				    "p": {"x": 10, "y": 10}
				}
			}
		}

		function get_rand_connection() {

			const ind1 = randint(0, count-1);
			const ind2 = randint(0, count-1);

			return [`n${ind1}`, `n${ind2}`, "p", "p", ["graph-connection"]];
		}

		function randint(min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}

		const modules = _.map(_.range(count), make_node);
		const connections = _.map(_.range(edges), get_rand_connection);
		return {modules, connections};

	}

	return {
		get_poets,
		get_graph
	};

})();