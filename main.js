var snap;

grid_minor = 20;
grid_major = 4;

scale = 1;

minor_attrs = ({stroke: '#dddddd', strokeDasharray: '1 1'});
major_attrs = ({stroke: '#dddddd'});

var width = 700;
var height = 700;

var shift = {x: 0, y: 0};

var drag_start = null;
var shift_anchor = null;

var grid;

var pos_label;

Mousetrap.bind('0', function() {
    shift_view(0, 0);
    return false;
});

Mousetrap.bind(['+', '='], function() {
    scale = Math.min(scale * 1.2, 4);
    shift_view(shift.x, shift.y);
    return false;
});

Mousetrap.bind('-', function() {
    scale = Math.max(scale / 1.2, 1);
    shift_view(shift.x, shift.y);
    return false;
});


function shift_view(x, y) {

    // shift view box

    w = width / scale;
    h = height / scale;

    vbox = [x - w/2, y-h/2, w, h];

    snap.attr({viewBox: vbox.join(',')});

    shift = {x: x, y: y};

    // calculate grid shift

    grid_repeat = grid_minor * grid_major;

    grid_x = Math.floor(x / grid_repeat) * grid_repeat;
    grid_y = Math.floor(y / grid_repeat) * grid_repeat;

    grid.attr({transform: "translate(" + grid_x + ", " + grid_y + ")"});

    // calculate position label shift

    pos_label_margin = 10 / scale;

    pos_label.attr({
        y: h - pos_label_margin + y - h/2,
        text: "(" + Math.round(x) + ", " + Math.round(y) + ") - " + Math.round(scale * 100) + "%" ,
        fontSize: 16 / scale
    });

    pos_label.attr({
        x: w - pos_label_margin + x - pos_label.getBBox().width - w/2
    });
}

window.onload = function () {

    snap = Snap(width, height);

    snap.mousedown(function(e) {

        drag_start = {x: e.x, y: e.y};
        shift_anchor = {x: shift.x, y:shift.y};

    });

    snap.mousemove(function(e) {

        if (e.buttons == 1) {

            new_x = shift_anchor.x - (e.x - drag_start.x) / scale;
            new_y = shift_anchor.y - (e.y - drag_start.y) / scale;

            shift_view(new_x, new_y);

        }

    });

    grid = snap.g();

    grid_minor_gr = grid.g();
    grid_major_gr = grid.g();

    var gv = Math.ceil(height / grid_minor) + 1;
    var gh = Math.ceil(width / grid_minor) + 1;

    for (var i = -gh; i<=gh; i++) {

        var xi = i * grid_minor;

        var line1 = snap.line(xi, -height/2, xi, height/2 + grid_minor * grid_major);

        var is_maj = i % grid_major == 0;

        line1.attr(is_maj ? major_attrs : minor_attrs);

        (is_maj ? grid_major_gr : grid_minor_gr).add(line1);

    }

    for (var i = -gv; i<=gv; i++) {

        var yi = i * grid_minor;

        var line2 = snap.line(-width/2, yi, width/2 + grid_minor * grid_major, yi);

        var is_maj = i % grid_major == 0;

        line2.attr(is_maj ? major_attrs : minor_attrs);

        (is_maj ? grid_major_gr : grid_minor_gr).add(line2);

    }

    m1 = drawModule(0, 0, "norGate1");
    m2 = drawModule(240, 80, "norGate2");
    m3 = drawModule(140, 220, "norGate3");

    addAnimations(m1);
    addAnimations(m2);
    addAnimations(m3);

    pos_label = snap.text(0, 0, "hello");

    pos_label.attr({
        fontFamily: "Inconsolata",
    });

    snap.circle(0, 0, 5);

    shift_view(0, 0);

};

function addAnimations(mod) {

    var hoverover = function() {
        mod.animate({ transform: 's1.1r0' }, 75, mina.easein);
    };

    var hoverout = function() {
        mod.animate({ transform: 's1r0' }, 75, mina.easein);
    };

    mod.hover(hoverover, hoverout);
}

function drawModule(cx, cy, label) {

    var mod_w = 80;
    var mod_h = 80;

    var x = cx - mod_w/2;
    var y = cy - mod_h/2;

    var gr = snap.g();

    var r1 = gr.rect(x, y, mod_w, mod_h, 5, 5).attr({fill: 'white', stroke: 'black'});

    var t1 = gr.text(x + mod_w/2, y + mod_h + 20, label);

    t1.attr({
        fontFamily: "Rambla",
        textAnchor: "Middle",
        alignmentBaseline: "central"
    });

    return gr;

}