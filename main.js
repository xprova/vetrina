const GRID_BLOCK = 200;
const GRID_LINES_P_BLOCK = 4;
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
    if (e.buttons == 4) {
        drag_start = {x: e.x, y: e.y};
        shift_anchor = {x: shift.x, y:shift.y};
    }
}

function mousemove_handler(e) {
    if (e.buttons == 4) {
        new_x = shift_anchor.x - (e.x - drag_start.x) / scale;
        new_y = shift_anchor.y - (e.y - drag_start.y) / scale;
        shift_view(new_x, new_y);
    }
}

function mousescroll_handler(e) {
    (e.wheelDelta < 0 ? zoom_in : zoom_out)();
}

function shift_view(x, y) {

    // shift view box

    w = width / scale;
    h = height / scale;
    vbox = [x - w/2, y-h/2, w, h];
    snap.attr({viewBox: vbox.join(',')});
    shift = {x: x, y: y};

    // calculate grid shift

    grid_repeat = GRID_BLOCK;

    grid_x = Math.floor(x / grid_repeat) * grid_repeat;
    grid_y = Math.floor(y / grid_repeat) * grid_repeat;

    grid.attr({transform: `translate(${grid_x}, ${grid_y})`});

    // re-position and adjust scale of coordinate label

    cord_label_margin = 10 / scale;

    var rx = Math.round(x);
    var ry = Math.round(y);
    var zl = Math.round(scale * 100);

    cord_label.attr({
        y: +h/2 - cord_label_margin + y,
        x: -w/2 + cord_label_margin + x,
        text: `(${rx}, ${ry}) - ${zl}%`,
        fontSize: 16 / scale
    });

}

// drawing functions

function draw_grid () {

    grid = snap.g();
    grid.attr({id: "grid"});

    grid_minor_gr = grid.g();
    grid_major_gr = grid.g();

    var gv = Math.ceil(height / GRID_BLOCK * GRID_LINES_P_BLOCK) + 1;
    var gh = Math.ceil(width / GRID_BLOCK * GRID_LINES_P_BLOCK) + 1;

    var h2 = height/2;
    var w2 = width/2;

    var gr = GRID_BLOCK;

    format_add_line = function (ind, line) {
        // apply line attributes then add to appropriate grid group
        var is_maj = ind % GRID_LINES_P_BLOCK == 0;
        line.attr(is_maj ? major_attrs : minor_attrs);
        (is_maj ? grid_major_gr : grid_minor_gr).add(line);
    }

    draw_hline = function (ind) {
        var xi = ind * GRID_BLOCK / GRID_LINES_P_BLOCK;
        var line = snap.line(xi, -h2, xi, h2 + gr);
        format_add_line(ind, line);
    }

    draw_vline = function (ind) {
        var yi = ind * GRID_BLOCK / GRID_LINES_P_BLOCK;
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
            modules.add(m);
        }
    }

    return modules;
}

// main function

window.onload = function () {

    snap = Snap(width, height);

    snap.mousedown(mousedown_handler);
    snap.mousemove(mousemove_handler);
    snap.node.addEventListener("mousewheel", mousescroll_handler, false);

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

    const mod_w = 80;
    const mod_h = 80;
    const port_pin_r = 5;
    const port_edge_length = 15;

    const port_line_style = {stroke: "black"};
    const port_label_style = {fontFamily: "Inconsolata"};
    const module_body_style = {fill: 'white', stroke: 'black'};
    const module_label_style = {fontFamily: "Rambla", textAnchor: "Middle",
        alignmentBaseline: "central"};

    var x = cx - mod_w/2;
    var y = cy - mod_h/2;
    var gr = snap.g();
    var r1 = gr.rect(x, y, mod_w, mod_h, 5, 5).attr(module_body_style);
    var t1 = gr.text(x + mod_w/2, y + mod_h + 20, label);

    gr.attr({id: label});
    t1.attr(module_label_style);

    function draw_port(x1, x2, y1, y2, label, halign, valign) {
        gr.line(x1, y1, x2, y2).attr(port_line_style);
        gr.circle(x2, y2, port_pin_r);
        text_obj = gr.text(x1, y1, label).attr(port_label_style);
        align_text(text_obj, x1, y1, halign, valign, 5);
    }

    function draw_left_port(y, label) {
        var x1 = x;
        var x2 = x - port_edge_length;
        var y1 = y;
        var y2 = y;
        draw_port(x1, x2, y1, y2, label, "right", "middle");
    }

    function draw_right_port(y, label) {
        var x1 = x + mod_w;
        var x2 = x1 + port_edge_length;
        var y1 = y;
        var y2 = y;
        draw_port(x1, x2, y1, y2, label, "left", "middle");
    }

    function draw_top_port(x, label) {
        var x1 = x;
        var x2 = x;
        var y1 = y;
        var y2 = y - port_edge_length;
        draw_port(x1, x2, y1, y2, label, "center", "bottom");
    }

    function draw_bottom_port(x, label) {
        var x1 = x;
        var x2 = x;
        var y2 = y + mod_h + port_edge_length;
        var y1 = y + mod_h;
        draw_port(x1, x2, y1, y2, label, "center", "top");
    }


    var left_ports = ["a", "b"];
    var right_ports = ["y"];
    var top_ports = ["north"];
    var bottom_ports = [];

    var ports = [
        [left_ports, draw_left_port, y, mod_h],
        [right_ports, draw_right_port, y, mod_h],
        [top_ports, draw_top_port, x, mod_w],
        [bottom_ports, draw_bottom_port, x, mod_w],
    ];

    var directions = ports.length;

    for (var i=0; i<directions; i++) {

        var [dports, dport_fun, dim, coord] = ports[i];
        var spacing = coord / (dports.length + 1);

        for (var j=0; j<dports.length; j++) {
            var pos = dim + spacing * (j+1);
            dport_fun(pos, dports[j]);
        }
    }

    return gr;
}