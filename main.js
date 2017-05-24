var snap;

grid_minor = 20;
grid_major = 4;

minor_attrs = ({stroke: '#eeeeee', strokeDasharray: '1 1'});
major_attrs = ({stroke: '#eeeeee'});

var width = 700;
var height = 500;

var shift = {x: 0, y: 0};

var drag_start = null;
var shift_anchor = null;

var grid;

Mousetrap.bind('0', function() {
    shift_view(0, 0);
    return false;
});

function shift_view(x, y) {

    snap.attr({viewBox: [x, y, width, height].join(',')});

    shift = {x: x, y: y};

    grid_repeat = grid_minor * grid_major;

    grid_x = Math.floor(x / grid_repeat) * grid_repeat;
    grid_y = Math.floor(y / grid_repeat) * grid_repeat;

    grid.attr({transform: "translate(" + grid_x + ", " + grid_y + ")"})
}

window.onload = function () {

    snap = Snap(width, height);

    snap.mousedown(function(e) {

        drag_start = {x: e.x, y: e.y};
        shift_anchor = {x: shift.x, y:shift.y};

    });

    snap.mousemove(function(e) {

        if (e.buttons == 1) {

            new_x = shift_anchor.x - (e.x - drag_start.x);
            new_y = shift_anchor.y - (e.y - drag_start.y);

            shift_view(new_x, new_y);

        }

    });

    grid = snap.g();

    grid_minor_gr = grid.g();
    grid_major_gr = grid.g();

    grid_minor_lines_h = Math.ceil(width/grid_minor);
    grid_minor_lines_v = Math.ceil(height/grid_minor);

    for (var i = 0; i<grid_minor_lines_h + grid_major + 1; i++) {

        var xi = i * grid_minor;

        var line1 = snap.line(xi, 0, xi, height + grid_minor * grid_major);

        var is_maj = i % grid_major == 0;

        line1.attr(is_maj ? major_attrs : minor_attrs);

        (is_maj ? grid_major_gr : grid_minor_gr).add(line1);

    }

    for (var i = 0; i<grid_minor_lines_v + grid_major + 1; i++) {

        var yi = i * grid_minor;

        var line2 = snap.line(0, yi, width + grid_minor * grid_major, yi);

        var is_maj = i % grid_major == 0;

        line2.attr(is_maj ? major_attrs : minor_attrs);

        (is_maj ? grid_major_gr : grid_minor_gr).add(line2);

    }

    m1 = drawModule(40, 40, "norGate1");
    m2 = drawModule(240, 80, "norGate2");
    m3 = drawModule(140, 220, "norGate3");

    addAnimations(m1);
    addAnimations(m2);
    addAnimations(m3);

};

function addAnimations(mod) {

    var hoverover = function() {
        // mod.animate({ transform: 's1.2r0,50,50' }, 250, mina.bounce);
        mod.animate({ transform: 's1.1r0' }, 150, mina.easein);
    };

    var hoverout = function() {
        mod.animate({ transform: 's1r0' }, 150, mina.easein);
    };

    mod.hover(hoverover, hoverout);
}

function drawModule(x, y, label) {

    var gr = snap.g();

    var r1 = gr.rect(x, y, 100, 100, 5, 5).attr({fill: 'white', stroke: 'black'});

    var t1 = gr.text(x + 50, y + 120, label);

    t1.attr({
        fontFamily: "Rambla",
        textAnchor: "Middle",
        alignmentBaseline: "central"
    });

    return gr;

}