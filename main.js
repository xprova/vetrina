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

function get_module_grid(template, id_) {

    modules = {};

    for (var i=0; i<10; i++) {
        for (var j=0; j<10; j++) {
            id = `${id_}_${i}_${j}`;
            newNor = {
                x: 200 * i,
                y: 200 * j,
            };
            _.extend(newNor, template);
            modules[id] = newNor;
        }
    }

    return modules;
}

window.onload = function () {

    modules = get_module_grid(norGate, "norGate");

    init_viewer("#svg1", modules);

};
