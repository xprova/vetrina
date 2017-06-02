
function get_module_grid() {

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

    modules = [];

    for (var i=0; i<10; i++) {
        for (var j=0; j<10; j++) {
            newNor = {
                label: `norGate_${i}_${j}`,
                x: 200 * i,
                y: 200 * j,
            };
            _.extend(newNor, norGate);
            modules.push(newNor);
        }
    }

    return modules;
}

window.onload = function () {

    modules = get_module_grid();

    init_viewer("#svg1", modules);

};
