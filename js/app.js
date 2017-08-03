(function () {

'use strict';

var modules = {};

// https://stackoverflow.com/a/43053803
const cartesian_f = (a, b) =>
    [].concat(...a.map(a => b.map(b => [].concat(a, b))));

const product = (a, b, ...c) => b ? product(cartesian_f(a, b), ...c) : a;

function get_module_grid(template, id_) {

    modules = {};

    var mod_tups = product(_.range(5), _.range(5));

    const makeMod = function (mod_tup) {

        var [i, j] = mod_tup;

        var id = `${id_}_${i}_${j}`;

        modules[id] = makeGate(template, {x: 200 * i + 200, y: 200 * j});
    }

    _.map(mod_tups, makeMod);

    return modules;
}

function makeGate(template, attrs = {}) {

    return _.chain(template).cloneDeep().extend(attrs).value();
}

window.onload = function () {

    modules = get_module_grid(corePOETS, "corePOETS");

    var core1 = makeGate(corePOETS);

    var block1 = makeGate(norGate);

    const [dx, dy, s] = [50, 25, 5];

    modules["gate1"] = makeGate(gateAnd, {x: -dx, y:+dy, id: "gate1"});
    modules["gate2"] = makeGate(gateAnd, {x: -dx, y:-dy, id: "gate2"});
    modules["gate3"] = makeGate(gateAnd, {x:0, y:0, id: "gate3"});
    modules["gate4"] = makeGate(gateInverter, {x:dx, y:0, id: "gate4"});

    modules["block1"] = makeGate(norGate, {x: 400, y:-200});

    _.each(nodes, function (node) {

        var [id_, x, y, gateTemplate] = node;

        var [nx, ny] = _.map([x, y], x => Math.round(x * s)/ s * 60);

        modules[id_] = makeGate(gateTemplate, {x: nx - 1000, y:ny, id: id_});

    });

    var svg_element = document.getElementById('svg1');

    viewer.init(svg_element, modules);

    _.each(connections, function (con) {

        var [from, to] = con;

        if (_.has(modules, from) && _.has(modules, to))
            viewer.draw_connection(from, to, "y", "a");

    });

    viewer.draw_connection("gate1", "gate3", "y", "a");
    viewer.draw_connection("gate2", "gate3", "y", "b");
    viewer.draw_connection("gate3", "gate4", "y", "a");
    viewer.draw_connection("gate4", "corePOETS_0_0", "y", "E");

    viewer.draw_connection("corePOETS_0_0", "corePOETS_1_1", "E", "W");
    viewer.draw_connection("corePOETS_1_1", "corePOETS_2_0", "E", "W");
    viewer.draw_connection("corePOETS_1_1", "corePOETS_2_2", "E", "W");

    viewer.draw_connection("corePOETS_0_0", "block1", "N", "a");
};

var nodes = [
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

var connections = [
    ["n3", "n18"],
    ["n4", "n22b"],
    ["n6", "n8"],
    ["n6", "n9"],
    ["n7", "n1"],
    ["n7", "n23"],
    ["n8", "n6b"],
    ["n9", "n12"],
    ["n9", "n17"],
    ["n12", "n7"],
    ["n12", "n21"],
    ["n16", "n12"],
    ["n16", "n17"],
    ["n17", "n16b"],
    ["n18", "n3b"],
    ["n23", "n15b"],
    ["n1", "n18"],
    ["n2", "n11b"],
    ["n5", "n7"],
    ["n5", "n21"],
    ["n10", "n13"],
    ["n10", "n2"],
    ["n11", "n13"],
    ["n11", "n2"],
    ["n13", "n8"],
    ["n13", "n9"],
    ["n15", "n1"],
    ["n15", "n23"],
    ["n19", "n24b"],
    ["n20", "n19"],
    ["n20", "n10"],
    ["n21", "n5b"],
    ["n22", "n4"],
    ["n22", "n20"],
    ["n24", "n19"],
    ["n24", "n10"]
]

})();
