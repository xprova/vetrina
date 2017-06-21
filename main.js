// https://stackoverflow.com/a/43053803
const cartesian_f = (a, b) =>
    [].concat(...a.map(a => b.map(b => [].concat(a, b))));

const product = (a, b, ...c) => b ? product(cartesian_f(a, b), ...c) : a;

function get_module_grid(template, id_) {

    modules = {};

    mod_tups = product(_.range(5), _.range(5));

    const makeMod = function (mod_tup) {

        [i, j] = mod_tup;

        id = `${id_}_${i}_${j}`;

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

    core1 = makeGate(corePOETS);

    block1 = makeGate(norGate);

    const [dx, dy, s] = [50, 25, 5];

    modules["gate1"] = makeGate(gateAnd, {x: -dx, y:+dy, id: "gate1"});
    modules["gate2"] = makeGate(gateAnd, {x: -dx, y:-dy, id: "gate2"});
    modules["gate3"] = makeGate(gateAnd, {x:0, y:0, id: "gate3"});
    modules["gate4"] = makeGate(gateInverter, {x:dx, y:0, id: "gate4"});

    modules["block1"] = makeGate(norGate, {x: 400, y:-200});

    _.each(nodes, function (node) {

        id_ = node[0];
        gateTemplate = node[3];
        nx = Math.round(node[1] * s)/s * 75 - 1500;
        ny = Math.round(node[2] * s)/s * 50 ;

        modules[id_] = makeGate(gateTemplate, {x: nx, y:ny, id: id_});

    });

    init_viewer("#svg1", modules);

    _.each(connections, function (con) {

        [from, to] = con;

        if (modules.hasOwnProperty(from) && modules.hasOwnProperty(to))
            draw_connection(from, to, "y", "a");

    });

    draw_connection("gate1", "gate3", "y", "a");
    draw_connection("gate2", "gate3", "y", "b");
    draw_connection("gate3", "gate4", "y", "a");
    draw_connection("gate4", "corePOETS_0_0", "y", "E");

    draw_connection("corePOETS_0_0", "corePOETS_1_1", "E", "W");
    draw_connection("corePOETS_1_1", "corePOETS_2_0", "E", "W");
    draw_connection("corePOETS_1_1", "corePOETS_2_2", "E", "W");

    draw_connection("corePOETS_0_0", "block1", "N", "a");
};

nodes = [
    ["n1",    "4.75",    "2.1806",  gateWire], // DFF
    ["n4",    "3.25",    "2.25",    gateWire], // DFF
    ["n5",    "0.375",   "2.0278",  gateWire], // DFF
    ["n6",    "1.75",    "0.43056", gateWire], // DFF
    ["n14",   "7.75",    "4.8889",  gateWire], // DFF
    ["n15",   "9.25",    "4.375",   gateWire], // DFF
    ["n22",   "6.25",    "3.8056",  gateWire], // DFF
    ["n23",   "10.75",   "5.25",    gateWire], // DFF
    ["n1b",   "7.75",    "1.1806",  gateWire], // DFF2
    ["n4b",   "6.25",    "3.0556",  gateWire], // DFF2
    ["n5b",   "3.25",    "3.0",     gateWire], // DFF2
    ["n6b",   "4.75",    "0.375",   gateWire], // DFF2
    ["n14b",  "10.75",   "6.0",     gateWire], // DFF2
    ["n15b",  "12.25",   "3.375",   gateWire], // DFF2
    ["n22b",  "9.25",    "2.4861",  gateWire], // DFF2
    ["n23b",  "13.625",  "4.8056",  gateWire], // DFF2
    ["n2",    "7.75",    "3.6528",  gateAnd],
    ["n3",    "4.75",    "1.3056",  gateAnd],
    ["n7",    "9.25",    "5.25",    gateXor],
    ["n8",    "3.25",    "1.375",   gateAnd],
    ["n9",    "3.25",    "0.375",   gateXor],
    ["n10",   "4.75",    "3.0556",  gateXor],
    ["n11",   "1.75",    "2.6806",  gateXor],
    ["n12",   "7.75",    "2.4861",  gateXor],
    ["n13",   "12.25",   "4.8056",  gateXor],
    ["n16",   "10.75",   "4.375",   gateAnd],
    ["n18",   "10.75",   "3.375",   gateXor],
    ["n19",   "6.25",    "2.1806",  gateAnd],
    ["n20",   "1.75",    "1.375",   gateAnd],
    ["n21",   "6.25",    "1.1806",  gateXor],
    ["n24",   "9.25",    "3.5",     gateAnd]
]

connections = [
    ["n3",   "n19" ],
    ["n3",   "n21" ],
    ["n5",   "n20" ],
    ["n5",   "n11" ],
    ["n9",   "n6b" ],
    ["n10",  "n4b" ],
    ["n11",  "n5b" ],
    ["n12",  "n22b"],
    ["n15",  "n16" ],
    ["n15",  "n18" ],
    ["n16",  "n13" ],
    ["n20",  "n8"  ],
    ["n20",  "n9"  ],
    ["n22",  "n12" ],
    ["n22",  "n2"  ],
    ["n1",   "n19" ],
    ["n1",   "n21" ],
    ["n2",   "n7"  ],
    ["n2",   "n24" ],
    ["n4",   "n3"  ],
    ["n4",   "n10" ],
    ["n6",   "n8"  ],
    ["n6",   "n9"  ],
    ["n7",   "n14b"],
    ["n8",   "n3"  ],
    ["n8",   "n10" ],
    ["n13",  "n23b"],
    ["n14",  "n7"  ],
    ["n14",  "n24" ],
    ["n18",  "n15b"],
    ["n19",  "n12" ],
    ["n19",  "n2"  ],
    ["n21",  "n1b" ],
    ["n23",  "n13" ],
    ["n24",  "n16" ],
    ["n24",  "n18" ],
]