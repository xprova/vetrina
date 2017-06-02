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

    modules = get_module_grid(corePOETS, "corePOETS");

    init_viewer("#svg1", modules);

};
