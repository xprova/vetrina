
function get_module_grid() {

    module_defs = [];

    for (var i=0; i<10; i++) {
        for (var j=0; j<10; j++) {
            module_defs.push({
                label: `norGate_${i}_${j}`,
                x: 200 * i,
                y: 200 * j,
            });
        }
    }

    return module_defs;
}

window.onload = function () {

    module_defs = get_module_grid();

    init_viewer("#svg1", module_defs);

};
