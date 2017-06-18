norGate = {
    ports: {
        "a": {position: "left"},
        "b": {position: "left"},
        "y": {position: "right"},
        "c": {position: "top"},
        "e": {position: "top"},
        "z": {position: "top"},
    },
    width: 100,
    height: 100
}

corePOETS = {
    image: "poets/poets_logo_white.svg",
    class: "poets",
    width: 100,
    height: 100,
    ports: {
        "W": {position: "left"},
        "E": {position: "right"},
        "N": {position: "top"},
    }
}

gateAnd = {
    svg: "logic-gates/gate-and.svg",
    class: "logic-gates",
    width: 50*1.0,
    height: 50*1.0,
    ports: {
        "a": {x:0, y:31.5*1.0},
        "b": {x:0, y:18.5*1.0},
        "y": {x:50*1.0, y:25*1.0},
    }
}

gateOr = {
    svg: "logic-gates/gate-or.svg",
    class: "logic-gates",
    width: 50*1.0,
    height: 50*1.0,
    ports: {
        "a": {x:0, y:31.5*1.0},
        "b": {x:0, y:18.5*1.0},
        "y": {x:50*1.0, y:25*1.0},
    }
}

gateXor = {
    svg: "logic-gates/gate-xor.svg",
    class: "logic-gates",
    width: 50*1.0,
    height: 50*1.0,
    ports: {
        "a": {x:0, y:31.5*1.0},
        "b": {x:0, y:18.5*1.0},
        "y": {x:50*1.0, y:25*1.0},
    }
}


gateNor = {
    svg: "logic-gates/gate-nor.svg",
    class: "logic-gates",
    width: 50*1.0,
    height: 50*1.0,
    ports: {
        "a": {x:0, y:31.5*1.0},
        "b": {x:0, y:18.5*1.0},
        "y": {x:50*1.0, y:25*1.0},
    }
}

gateNand = {
    svg: "logic-gates/gate-nand.svg",
    class: "logic-gates",
    width: 50*1.0,
    height: 50*1.0,
    ports: {
        "a": {x:0, y:31.5*1.0},
        "b": {x:0, y:18.5*1.0},
        "y": {x:50*1.0, y:25*1.0},
    }
}

gateBuffer = {
    svg: "logic-gates/gate-buffer.svg",
    class: "logic-gates",
    width: 50*1.0,
    height: 50*1.0,
    ports: {
        "a": {x:00*1.0, y:25*1.0},
        "y": {x:50*1.0, y:25*1.0},
    }
}

gateWire = {
    svg: "logic-gates/gate-wire.svg",
    class: "logic-gates",
    width: 50*1.0,
    height: 50*1.0,
    ports: {
        "a": {x:00*1.0, y:25*1.0},
        "y": {x:50*1.0, y:25*1.0},
    }
}

gateInverter = {
    svg: "logic-gates/gate-inverter.svg",
    class: "logic-gates",
    width: 50*1.0,
    height: 50*1.0,
    ports: {
        "a": {x:00*1.0, y:25*1.0},
        "y": {x:50*1.0, y:25*1.0},
    }
}

function get_module_grid(template, id_) {

    modules = {};

    for (var i=0; i<5; i++) {
        for (var j=0; j<5; j++) {
            id = `${id_}_${i}_${j}`;
            newNor = {
                x: 200 * i + 200,
                y: 200 * j,
            };
            temp1 = JSON.parse(JSON.stringify(template)); // ugly, TODO
            _.extend(newNor, temp1);
            modules[id] = newNor;
        }
    }

    return modules;
}

window.onload = function () {

    modules = get_module_grid(corePOETS, "corePOETS");
    // modules = {};

    gate1 = JSON.parse(JSON.stringify(gateAnd)); // ugly, TODO
    gate2 = JSON.parse(JSON.stringify(gateNand)); // ugly, TODO
    gate3 = JSON.parse(JSON.stringify(gateAnd)); // ugly, TODO

    core1 = JSON.parse(JSON.stringify(corePOETS)); // ugly, TODO

    block1 = JSON.parse(JSON.stringify(norGate)); // ugly, TODO

    gate4 = JSON.parse(JSON.stringify(gateInverter)); // ugly, TODO

    var dx = 50;
    var dy = 25;

    modules["gate1"] = _.defaults(gate2, {x: -dx, y:+dy});
    modules["gate2"] = _.defaults(gate3, {x: -dx, y:-dy});
    modules["gate3"] = _.defaults(gate1, {x: 0, y:0});
    modules["gate4"] = _.defaults(gate4, {x: +dx, y:0});

    // modules["core1"] = _.defaults(corePOETS, {x: 400, y:0});

    modules["block1"] = _.defaults(norGate, {x: 400, y:-200});

    _.each(nodes, function (node) {

        id_ = node[0];
        gateTemplate = node[3];
        var s = 5;
        nx = Math.round(node[1] * s)/s * 75 - 1500;
        ny = Math.round(node[2] * s)/s * 50 ;

        node_gate = JSON.parse(JSON.stringify(gateTemplate)); // ugly, TODO
        modules[id_] = _.defaults(node_gate, {x: nx, y:ny, id: id_});

    });

    init_viewer("#svg1", modules);

    _.each(connections, function (con) {

        [from, to] = con;

        if (modules.hasOwnProperty(from) && modules.hasOwnProperty(to)) {

            draw_connection(from, to, "y", "a");

        }

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