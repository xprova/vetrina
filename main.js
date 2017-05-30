const grid_minor = 20;
const grid_major = 4;
const minor_attrs = ({stroke: '#dddddd', strokeDasharray: '1 1'});
const major_attrs = ({stroke: '#dddddd'});

var scale = 1;
var snap;
var modules;
var width = 1600;
var height = 1000;
var shift = {x: 0, y: 0};
var drag_start = null;
var shift_anchor = null;
var grid; // svg group of grid lines
var cord_label;

Mousetrap.bind('0', reset_view);
Mousetrap.bind(['+', '='], zoom_in);
Mousetrap.bind('-', zoom_out);

function reset_view() {
    shift_view(0, 0);
    return false;
}

function zoom_in() {
    scale = Math.min(scale * 1.2, 4);
    shift_view(shift.x, shift.y);
    return false;
}

function zoom_out() {
    scale = Math.max(scale / 1.2, 1);
    shift_view(shift.x, shift.y);
    return false;
}

// mouse handlers

function mousedown_handler(e) {
    drag_start = {x: e.x, y: e.y};
    shift_anchor = {x: shift.x, y:shift.y};
}

function mousemove_handler(e) {
    if (e.buttons == 1) {
        new_x = shift_anchor.x - (e.x - drag_start.x) / scale;
        new_y = shift_anchor.y - (e.y - drag_start.y) / scale;
        shift_view(new_x, new_y);
    }
}

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

    grid.attr({transform: `translate(${grid_x}, ${grid_y})`});

    // re-position and adjust scale of coordinate label

    cord_label_margin = 10 / scale;

    var rx = Math.round(x);
    var ry = Math.round(y);
    var zl = Math.round(scale * 100);

    cord_label.attr({
        y: h - cord_label_margin + y - h/2,
        text: `(${rx}, ${ry}) - ${zl}%`,
        fontSize: 16 / scale
    });

    // adjust x coordinate after setting text so as to use bbox

    cord_label.attr({
        x: w - cord_label_margin + x - cord_label.getBBox().width - w/2
    });
}

// drawing functions

function draw_grid () {

    grid = snap.g();
    grid.attr({id: "grid"});

    grid_minor_gr = grid.g();
    grid_major_gr = grid.g();

    var gv = Math.ceil(height / grid_minor) + 1;
    var gh = Math.ceil(width / grid_minor) + 1;

    var h2 = height/2;
    var w2 = width/2;

    var gr = grid_minor * grid_major;

    format_add_line = function (ind, line) {
        // apply line attributes then add to appropriate grid group
        var is_maj = ind % grid_major == 0;
        line.attr(is_maj ? major_attrs : minor_attrs);
        (is_maj ? grid_major_gr : grid_minor_gr).add(line);
    }

    draw_hline = function (ind) {
        var xi = ind * grid_minor;
        var line = snap.line(xi, -h2, xi, h2 + gr);
        format_add_line(ind, line);
    }

    draw_vline = function (ind) {
        var yi = ind * grid_minor;
        var line = snap.line(-w2, yi, w2 + gr, yi);
        format_add_line(ind, line);
    }

    _.map(_.range(-gh, gh+1), draw_hline);
    _.map(_.range(-gv, gv+1), draw_vline);

    return grid;
}

function draw_modules() {

    modules = snap.g();

    for (var i=0; i<10; i++) {
        for (var j=0; j<10; j++) {
            mod_label = `norGate_${i}_${j}`;
            mx = 200 * i;
            my = 200 * j;
            m = drawModule(mx, my, mod_label);
            addAnimations(m);
            // modules.add(m);
            all_modules.push(m);
            all_mod_names.push(document.getElementById(mod_label));
        }
    }

    return modules;
}

// main function

window.onload = function () {

    snap = Snap(width, height);

    snap.mousedown(mousedown_handler);
    snap.mousemove(mousemove_handler);

    grid = draw_grid();

    draw_modules();

    cord_label = snap.text(0, 0, "").attr({fontFamily: "Inconsolata"});

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

function align_text(text_obj, x, y, halign, valign, margin) {

    // Align an svg object `text_obj` to (x, y)
    //
    // halign in ["left", "center", "right"]
    // valign in ["top", "middle", "bottom"]
    //
    // Note that (halign, valign) = ("right", "middle") will align text
    // to the right and middle of (x, y)

    var bbox = text_obj.getBBox();
    var w = bbox.width;
    var h = bbox.height;
    var x0, y0;

    if (halign == "right")
        x0 = x + 5;
    else if (halign == "center")
        x0 = x - w/2;
    else // (halign == "left")
        x0 = x - w - 5;

    if (valign == "top")
        y0 = y - h/2 - 5;
    else if (valign == "middle")
        y0 = y;
    else // (valign == "bottom")
        y0 = y + h/2 + 5;

    text_obj.attr({x: x0, y:y0, alignmentBaseline: "central"});
}

function drawModule(cx, cy, label) {

    var mod_w = 80;
    var mod_h = 80;
    var x = cx - mod_w/2;
    var y = cy - mod_h/2;
    var gr = snap.g();
    gr.attr({id: label});
    var r1 = gr.rect(x, y, mod_w, mod_h, 5, 5).attr({fill: 'white', stroke: 'black'});
    var t1 = gr.text(x + mod_w/2, y + mod_h + 20, label);
    var port_pin_r = 5;

    function draw_left_port(y, label) {
        var x1 = x;
        var x2 = x - 15;
        var y1 = y;
        var y2 = y;
        gr.line(x1, y1, x2, y2).attr({stroke: "black"});
        gr.circle(x2, y2, port_pin_r);
        text_obj = gr.text(x1, y1, label).attr({fontFamily: "Inconsolata"});
        align_text(text_obj, x1, y1, "right", "middle", 5);
    }

    function draw_right_port(y, label) {
        var x1 = x + mod_w;
        var x2 = x1 + 15;
        var y1 = y;
        var y2 = y;
        gr.line(x1, y1, x2, y2).attr({stroke: "black"});
        gr.circle(x2, y2, port_pin_r);
        text_obj = gr.text(x1, y1, label).attr({fontFamily: "Inconsolata"});
        align_text(text_obj, x1, y1, "left", "middle", 5);
    }

    var left_ports = ["a", "b"];
    var right_ports = ["y"];

    var left_port_spacing = mod_h / (left_ports.length + 1);
    var right_port_spacing = mod_h / (right_ports.length + 1);

    for (var i=0; i<left_ports.length; i++) {
        var py = y + left_port_spacing * (i+1);
        draw_left_port(py, left_ports[i]);
    }

    for (var i=0; i<right_ports.length; i++) {
        var py = y + right_port_spacing * (i+1);
        draw_right_port(py, right_ports[i]);
    }

    t1.attr({
        fontFamily: "Rambla",
        textAnchor: "Middle",
        alignmentBaseline: "central"
    });

    return gr;
}