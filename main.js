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

gateNand = {
    svg: "logic-gates/gate-xnor.svg",
    class: "logic-gates",
    width: 50*1.0,
    height: 50*1.0,
    ports: {
        "a": {x:0, y:31.5*1.0},
        "b": {x:0, y:18.5*1.0},
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

    var dx = 60;
    var dy = 25;

    modules["gate1"] = _.defaults(gate2, {x: -dx, y:+dy});
    modules["gate2"] = _.defaults(gate3, {x: -dx, y:-dy});
    modules["gate3"] = _.defaults(gate1, {x: 0, y:0});

    // modules["core1"] = _.defaults(corePOETS, {x: 400, y:0});

    modules["block1"] = _.defaults(norGate, {x: 400, y:-200});

    init_viewer("#svg1", modules);

    draw_connection("gate1", "gate3", "y", "a");
    draw_connection("gate2", "gate3", "y", "b");
    draw_connection("gate3", "corePOETS_0_0", "y", "E");

    draw_connection("corePOETS_0_0", "corePOETS_1_1", "E", "W");
    draw_connection("corePOETS_1_1", "corePOETS_2_0", "E", "W");
    draw_connection("corePOETS_1_1", "corePOETS_2_2", "E", "W");

    draw_connection("corePOETS_0_0", "block1", "N", "a");

};
