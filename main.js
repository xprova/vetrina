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
        gate_type = node[3];
        var s = 5;
        nx = Math.round(node[1] * s)/s * 75 - 1500;
        ny = Math.round(node[2] * s)/s * 50 ;


        if (gate_type.indexOf("nand") != -1) {
            gateTemplate = gateNand;
            // console.log(`${id_} is a nand`);
        } else if (gate_type.indexOf("dff") != -1) {
            gateTemplate = gateNand;
            // console.log(`${id_} is a nand`);
        } else if (gate_type.indexOf("and") != -1) {
            gateTemplate = gateAnd;
            // console.log(`${id_} is an and`);
        } else if (gate_type.indexOf("or") != -1) {
            gateTemplate = gateOr;
            // console.log(`${id_} is an or`);
        } else if (gate_type.indexOf("not") != -1) {
            gateTemplate = gateInverter;
            // console.log(`${id_} is an inverter`);
        } else {
            gateTemplate = gateWire;
            // console.log(`${id_} is a wire`);
        }


        node_gate = JSON.parse(JSON.stringify(gateTemplate)); // ugly, TODO
        modules[id_] = _.defaults(node_gate, {x: nx, y:ny, id: id_});
        // console.log(node);
    });

    init_viewer("#svg1", modules);

    _.each(connections, function (con) {

        [from, to, port] = con;

        if (modules.hasOwnProperty(from) && modules.hasOwnProperty(to)) {

            console.log(con);
            console.log(modules[from]);
            console.log(modules[to]);
            if (modules[from].svg == "logic-gates/gate-wire.svg") {
                console.log("wire to gate");
                if (port == "-")
                    port = "a";
                if (port == "D")
                    port = "a";
                draw_connection(from, to, "y", port);
            } else {
                if (port == "-")
                    port = "y";
                console.log("gate to wire");
                draw_connection(from, to, port, "a");
            }
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
    ["n1",   "5.3566",  "2.4583",    "*and60",      "khaki1"],
    ["n3",   "3.7162",  "9.7639",    "n17",         "lightgrey"],
    ["n4",   "3.7162",  "4.25",      "*n57",        "lightgrey"],
    ["n5",   "5.3566",  "12.097",    "or3",         "khaki1"],
    ["n6",   "8.605",   "7.2083",    "nor1",        "khaki1"],
    ["n7",   "5.3566",  "7.8056",    "or1",         "khaki1"],
    ["n8",   "5.3566",  "0.90278",   "*or51",       "khaki1"],
    ["n9",   "2.1081",  "4.25",      "*or54",       "khaki1"],
    ["n10",  "3.7162",  "3",         "*n58",        "lightgrey"],
    ["n11",  "8.605",   "10.958",    "or2",         "khaki1"],
    ["n13",  "2.1081",  "3",         "*not55",      "khaki1"],
    ["n14",  "5.3566",  "10.306",    "nand2",       "khaki1"],
    ["n15",  "6.9646",  "2.4583",    "*n61",        "lightgrey"],
    ["n16",  "5.3566",  "6.5556",    "nand4",       "khaki1"],
    ["n18",  "12.713",  "9.5278",    "nor2",        "khaki1"],
    ["n19",  "15.962",  "11.056",    "dff2",        "limegreen"],
    ["n20",  "2.1081",  "0.5",       "*tie148",     "khaki1"],
    ["n21",  "10.213",  "9.7083",    "n8",          "lightgrey"],
    ["n22",  "3.7162",  "6.0278",    "n16",         "lightgrey"],
    ["n23",  "6.9646",  "10.306",    "n6",          "lightgrey"],
    ["n24",  "10.213",  "12.208",    "n12",         "lightgrey"],
    ["n25",  "12.713",  "6.3194",    "and1",        "khaki1"],
    ["n26",  "8.605",   "9.7083",    "nand3",       "khaki1"],
    ["n27",  "0.5",     "12.986",    "tie01",       "khaki1"],
    ["n28",  "5.3566",  "4.25",      "*dff59",      "limegreen"],
    ["n29",  "8.605",   "0.90278",   "*dff50",      "limegreen"],
    ["n30",  "14.321",  "9.5278",    "n1",          "lightgrey"],
    ["n31",  "10.213",  "7.2083",    "n5",          "lightgrey"],
    ["n33",  "6.9646",  "9.0556",    "n4",          "lightgrey"],
    ["n34",  "2.1081",  "12.986",    "n18",         "lightgrey"],
    ["n35",  "8.605",   "12.208",    "nand5",       "khaki1"],
    ["n37",  "6.9646",  "7.8056",    "n9",          "lightgrey"],
    ["n38",  "6.9646",  "12.181",    "n11",         "lightgrey"],
    ["n39",  "10.213",  "8.4583",    "n14",         "lightgrey"],
    ["n40",  "2.1081",  "6.0278",    "not1",        "khaki1"],
    ["n41",  "17.559",  "5.7778",    "n3",          "lightgrey"],
    ["n42",  "2.1081",  "10.583",    "not2",        "khaki1"],
    ["n43",  "11.463",  "5.4306",    "n13",         "lightgrey"],
    ["n44",  "14.321",  "6.3194",    "n15",         "lightgrey"],
    ["n45",  "15.962",  "9.5278",    "dff1",        "limegreen"],
    ["n46",  "3.7162",  "0.5",       "*n49",        "lightgrey"],
    ["n47",  "5.3566",  "9.0556",    "nand1",       "khaki1"],
    ["n48",  "6.9646",  "0.90278",   "*n52",        "lightgrey"],
    ["n49",  "14.321",  "11.056",    "n2",          "lightgrey"],
    ["n50",  "0.5",     "5.1389",    "state[2]",    "plum"],
    ["n51",  "15.962",  "5.7778",    "nand8",       "khaki1"],
    ["n52",  "8.605",   "5.4306",    "nand7",       "khaki1"],
    ["n53",  "3.7162",  "11.194",    "a",           "plum"],
    ["n55",  "0.5",     "11.167",    "state[1]",    "plum"],
    ["n56",  "8.605",   "8.4583",    "or4",         "khaki1"],
    ["n57",  "10.213",  "10.958",    "n10",         "lightgrey"],
    ["n58",  "6.9646",  "6.5556",    "n7",          "lightgrey"],
    ["n59",  "0.5",     "3.4444",    "*n56",        "lightgrey"],
    ["n60",  "3.7162",  "7.8056",    "state[0]",    "plum"],
    ["n61",  "12.713",  "11.056",    "nand6",       "khaki1"],
    ["n62",  "19.199",  "5.7778",    "dff3",        "limegreen"],
    ["n17",  "3.7162",  "1.75",      "n17",         "lightgrey"]
]

connections = [
    ["n1", "n15", "-"],
    ["n3", "n14", "b"],
    ["n3", "n7", "a"],
    ["n3", "n47", "a"],
    ["n4", "n28", "D"],
    ["n5", "n38", "y"],
    ["n6", "n31", "y"],
    ["n7", "n58", "y"],
    ["n8", "n48", "-"],
    ["n9", "n4", "-"],
    ["n10", "n1", "-"],
    ["n11", "n57", "y"],
    ["n13", "n10", "-"],
    ["n14", "n23", "y"],
    ["n16", "n37", "y"],
    ["n17", "n1", "-"],
    ["n17", "n8", "-"],
    ["n18", "n30", "y"],
    ["n20", "n46", "y"],
    ["n21", "n18", "a"],
    ["n22", "n6", "b"],
    ["n22", "n16", "a"],
    ["n23", "n26", "b"],
    ["n23", "n56", "b"],
    ["n24", "n61", "a"],
    ["n25", "n44", "y"],
    ["n26", "n21", "y"],
    ["n27", "n34", "y"],
    ["n30", "n45", "D"],
    ["n31", "n18", "b"],
    ["n33", "n52", "a"],
    ["n33", "n6", "a"],
    ["n33", "n35", "b"],
    ["n35", "n24", "y"],
    ["n37", "n56", "a"],
    ["n37", "n11", "a"],
    ["n38", "n35", "a"],
    ["n39", "n25", "a"],
    ["n40", "n22", "y"],
    ["n41", "n62", "D"],
    ["n42", "n3", "y"],
    ["n43", "n51", "b"],
    ["n44", "n51", "a"],
    ["n46", "n8", "-"],
    ["n47", "n33", "y"],
    ["n48", "n29", "D"],
    ["n49", "n19", "D"],
    ["n50", "n52", "b"],
    ["n50", "n40", "a"],
    ["n50", "n9", "-"],
    ["n51", "n41", "y"],
    ["n52", "n43", "y"],
    ["n53", "n14", "a"],
    ["n53", "n5", "a"],
    ["n53", "n11", "b"],
    ["n55", "n42", "a"],
    ["n55", "n5", "b"],
    ["n56", "n39", "y"],
    ["n57", "n61", "b"],
    ["n58", "n25", "b"],
    ["n58", "n26", "a"],
    ["n59", "n9", "-"],
    ["n59", "n13", "-"],
    ["n60", "n16", "b"],
    ["n60", "n7", "b"],
    ["n60", "n47", "b"],
    ["n61", "n49", "y"]
]