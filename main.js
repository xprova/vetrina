
function get_module_grid() {

    modules = [];

    for (var i=0; i<10; i++) {
        for (var j=0; j<10; j++) {
            modules.push({
                label: `norGate_${i}_${j}`,
                x: 200 * i,
                y: 200 * j,
                left_ports: ["a", "b"],
                right_ports: ["y"],
                top_ports: ["z", "c", "e"],
            });
        }
    }

    return modules;
}

window.onload = function () {

    modules = get_module_grid();

    init_viewer("#svg1", modules);

};
