norGate = {
    ports: {
        "a": {position: "left"},
        "b": {position: "left"},
        "y": {position: "right"},
        "c": {position: "top"},
        "e": {position: "top"},
        "z": {position: "top"},
    }
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

gate = {
    svg: "logic-gates/gate1.svg",
    class: "logic-gates",
    width: 100,
    height: 100,
    ports: {
        "W": {position: "left"},
        "E": {position: "right"},
        "N": {position: "top"},
    }
}


function get_module_grid(template, id_) {

    modules = {};

    for (var i=0; i<10; i++) {
        for (var j=0; j<10; j++) {
            id = `${id_}_${i}_${j}`;
            newNor = {
                x: 200 * i,
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
    modules = {};

    temp1 = JSON.parse(JSON.stringify(gate)); // ugly, TODO

    newGate = {
        x: 0,
        y: 0
    };

    _.extend(newGate, temp1);

    modules["gate1"] = newGate;

    init_viewer("#svg1", modules);

    // draw_connection("corePOETS_0_0", "corePOETS_1_1", "E", "W");
    // draw_connection("corePOETS_1_1", "corePOETS_2_0", "E", "W");
    // draw_connection("corePOETS_1_1", "corePOETS_2_2", "E", "W");

};
