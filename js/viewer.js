viewer = (function() {

    'use strict';

    const GRID_BLOCK = 200;
    const GRID_LINES_P_BLOCK = 4;
    const PAN_STEP = 50;

    var scale = 1;
    var snap;
    var snap_element;
    var palette_visible = false;
    var width = 1000;
    var height = 1000;
    var shift = {x: 0, y: 0};
    var drag_start = null;
    var shift_anchor = null;
    var grid_layer;
    var module_layer;
    var connector_layer;
    var cord_label;
    var modules = {};
    var connections = [];
    var offset_x;
    var offset_y;

    function pan(direction) {
        var new_x = shift.x;
        var new_y = shift.y;
        new_x += direction == 'right' ? PAN_STEP : 0;
        new_x += direction == 'left' ? -PAN_STEP : 0;
        new_y += direction == 'down' ? +PAN_STEP : 0;
        new_y += direction == 'up' ? -PAN_STEP : 0;
        shift_view(new_x, new_y);
    }

    function reset_view() {
        scale = 1;
        shift_view(0, 0);
        return false;
    }

    function get_point(mpoint) {
        // Return the point (x,y) in svg coordinates corresponding to a
        // mouse-coordinate "mpoint" (mx, my)
        const [mx, my] = mpoint;
        const delta_x = mx - width/2;
        const delta_y = my - height/2;
        const x = shift.x + delta_x / scale;
        const y = shift.y + delta_y / scale;
        const point = [x, y];
        return point;
    }

    function get_mpoint(point) {
        // Return the mouse-coordinate "mpoint" (mx, my) corresponding to a
        // point (x, y) in svg coordinates
        const [x, y] = point;
        const delta_x = (x - shift.x) * scale;
        const delta_y = (y - shift.y) * scale;
        const mx = delta_x + width/2;
        const my = delta_y + height/2;
        const mpoint = [mx, my];
        return mpoint;
    }

    function zoom_in(mpoint=null) {
        const new_scale = Math.min(scale * 1.2, 4);
        zoom(new_scale, mpoint);
        return false;
    }

    function zoom_out(mpoint=null) {
        const new_scale = Math.max(scale / 1.2, 1);
        zoom(new_scale, mpoint);
        return false;
    }

    function zoom(new_scale, mpoint=null) {
        if (_.isNull(mpoint))
            mpoint = get_mpoint([shift.x, shift.y]);
        var point1 = get_point(mpoint);
        scale = new_scale;
        var mpoint_after = get_mpoint(point1);
        var delta_m = _.zipWith(mpoint_after, mpoint, _.subtract);
        var delta = _.map(delta_m, x => x / scale);
        shift_view(shift.x + delta[0], shift.y + delta[1]);
        return false;
    }

    function toggle_grid() {
        var current_style = grid_layer.attr("display");
        var new_style = current_style == 'inline' ? 'none' : 'inline';
        grid_layer.attr({display: new_style});
    }

    // mouse handlers

    function mousedown_handler(e) {
        if (e.buttons == 1) {
            drag_start = {x: e.x, y: e.y};
            shift_anchor = {x: shift.x, y:shift.y};
        }
    }

    function mousemove_handler(e) {
        if (e.buttons == 1) {
            var new_x = shift_anchor.x - (e.x - drag_start.x) / scale;
            var new_y = shift_anchor.y - (e.y - drag_start.y) / scale;
            shift_view(new_x, new_y);
        }
    }

    function mousescroll_handler(e) {
        var mpoint = [e.x - offset_x, e.y - offset_y];
        var zoom_fun = e.wheelDelta > 0 ? zoom_in : zoom_out;
        zoom_fun(mpoint);
    }

    function shift_view(x, y) {

        // shift view box

        var w = width / scale;
        var h = height / scale;
        var vbox = [x - w/2, y-h/2, w, h];
        snap.attr({viewBox: vbox.join(',')});
        shift = {x: x, y: y};

        // calculate grid shift

        var grid_x = Math.floor(x / GRID_BLOCK) * GRID_BLOCK;
        var grid_y = Math.floor(y / GRID_BLOCK) * GRID_BLOCK;

        grid_layer.attr({transform: `translate(${grid_x}, ${grid_y})`});

        // re-position and adjust scale of coordinate label

        var cord_label_margin = 10 / scale;

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

    function get_view_cords() {
        // Return coords of current view
        return [shift.x, shift.y];
    }

    // drawing functions

    function draw_grid (layer) {

        _.map(layer.children(), x => x.remove());

        var grid_minor_layer = layer.g();
        var grid_major_layer = layer.g();

        grid_minor_layer.attr({id: 'grid_minor'});
        grid_major_layer.attr({id: 'grid_major'});

        var gv = Math.ceil(height / GRID_BLOCK * GRID_LINES_P_BLOCK) + 1;
        var gh = Math.ceil(width / GRID_BLOCK * GRID_LINES_P_BLOCK) + 1;

        var h2 = height/2;
        var w2 = width/2;

        var gr = GRID_BLOCK;

        function format_add_line(ind, line) {
        // apply line attributes then add to appropriate grid group
        var is_maj = ind % GRID_LINES_P_BLOCK == 0;
        (is_maj ? grid_major_layer : grid_minor_layer).add(line);
    }

    function draw_hline(ind) {
        var xi = ind * GRID_BLOCK / GRID_LINES_P_BLOCK;
        var line = snap.line(xi, -h2, xi, h2 + gr);
        format_add_line(ind, line);
    }

    function draw_vline(ind) {
        var yi = ind * GRID_BLOCK / GRID_LINES_P_BLOCK;
        var line = snap.line(-w2, yi, w2 + gr, yi);
        format_add_line(ind, line);
    }

    _.map(_.range(-gh, gh+1), draw_hline);
    _.map(_.range(-gv, gv+1), draw_vline);

}

    // main function

    var addEvent = function(object, type, callback) {
        if (object == null || typeof(object) == 'undefined') return;
        if (object.addEventListener) {
            object.addEventListener(type, callback, false);
        } else if (object.attachEvent) {
            object.attachEvent("on" + type, callback);
        } else {
            object["on"+type] = callback;
        }
    };

    function init(selector) {

        snap_element = document.querySelector(selector);

        snap = Snap(snap_element);

        addEvent(snap_element, "mousedown", (e) => palette.hide()); // TODO: extract to app.js

        snap.mousedown(mousedown_handler);
        snap.mousemove(mousemove_handler);
        snap.node.addEventListener("mousewheel", mousescroll_handler, false);
        addEvent(window, "resize", window_resize_handler);

        grid_layer = snap.g();
        connector_layer = snap.g();
        module_layer = snap.g();

        grid_layer.attr({id: "grid"});
        module_layer.attr({id: "modules"});

        draw_grid(grid_layer);

        cord_label = snap.text(0, 0, "").attr({fontFamily: "Inconsolata"});

        window_resize_handler();

        shift_view(0, 0);

    }

    function window_resize_handler(event) {

        var bbox = snap_element.getBoundingClientRect();
        [width, height, offset_x, offset_y] = [bbox.width, bbox.height, bbox.left, bbox.top];

        draw_grid(grid_layer);
        shift_view(shift.x, shift.y);

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
            x0 = x + margin;
        else if (halign == "center")
            x0 = x - w/2;
        else // (halign == "left")
            x0 = x - w - margin;

        if (valign == "top")
            y0 = y - h/2 - margin;
        else if (valign == "middle")
            y0 = y;
        else // (valign == "bottom")
            y0 = y + h/2 + margin;

        text_obj.attr({x: x0, y:y0, alignmentBaseline: "central"});
    }

    function add_module(mod) {

        const mod_w = mod.width || 100;
        const mod_h = mod.height || 100;

        const mod_x = mod.x || 0;
        const mod_y = mod.y || 0;

        const port_pin_r = 5;
        const port_edge_length = 15;
        const class_ = mod.hasOwnProperty("class") ? mod.class : "module"

        const port_line_class    = `${class_}-port-line`;
        const port_label_class   = `${class_}-port-label`;
        const body_class         = `${class_}-body`;
        const module_label_class = `${class_}-label`;

        var x = mod_x - mod_w/2;
        var y = mod_y - mod_h/2;

        var gr = snap.g();
        gr.attr({id: mod.id});

        if (mod.hasOwnProperty("class"))
            gr.addClass(mod.class);

        _.each(mod.classes || [], cls => gr.addClass(cls));

        function draw_port(x1, x2, y1, y2, label, halign, valign) {
            gr.line(x1, y1, x2, y2).addClass(port_line_class);
            gr.circle(x2, y2, port_pin_r);
            var text_obj = gr.text(x1, y1, label).addClass(port_label_class);
            align_text(text_obj, x1, y1, halign, valign, 5);
            mod.ports[label].x = x2 - x;
            mod.ports[label].y = y2 - y;
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

        function get_ports(position) {

            return _.chain(mod.ports)
            .map((x, y) => [y, x.position]) // [port, position] tuples
            .filter(x => x[1] == position) // keep tuples with correct position
            .map(_.first) // take port names
            .value();
        }

        if (mod.hasOwnProperty("svg")) {

            // svg module

            var img = gr.image(mod.svg, x, y, "", "");

            img.attr({preserveAspectRatio: "xMaxYMax"});

            var t1 = gr.text(x + mod_w/2, y + mod_h, mod.id);

            t1.addClass(module_label_class);

            align_text(t1, x + mod_w/2, y + mod_h, "center", "bottom", -10);

        } else {

            // block module

            var r1 = gr.rect(x, y, mod_w, mod_h, 5, 5);
            var t1 = gr.text(x + mod_w/2, y + mod_h + 20, mod.id);

            r1.addClass(body_class);
            t1.addClass(module_label_class);

            align_text(t1, x + mod_w/2, y + mod_h, "center", "bottom", 10);

            if (mod.hasOwnProperty("image")) {
                var img = gr.image(mod.image, x, y, mod_w, mod_h);
                img.attr({preserveAspectRatio: "xMinYMid"});
            }

            var ports = [
                [get_ports("left")   || [], draw_left_port,   y, mod_h],
                [get_ports("right")  || [], draw_right_port,  y, mod_h],
                [get_ports("top")    || [], draw_top_port,    x, mod_w],
                [get_ports("bottom") || [], draw_bottom_port, x, mod_w],
            ];

            for (var i=0; i<ports.length; i++) {

                var [dports, dport_fun, dim, coord] = ports[i];
                var spacing = coord / (dports.length + 1);

                for (var j=0; j<dports.length; j++) {
                    var pos = dim + spacing * (j+1);
                    dport_fun(pos, dports[j]);
                }
            }

        }

        modules[mod.id] = _.assign(mod, {snap_group: gr});

    }

    function add_connection(connection) {

        const [mod1, mod2, port1, port2] = connection;

        var m1 = modules[mod1];
        var m2 = modules[mod2];

        if (m1 == null) {
            console.error(`could not find module ${mod1}`);
            return;
        }
        if (m2 == null) {
            console.error(`could not find module ${mod2}`);
            return ;
        }

        var p1 = m1.ports[port1];
        var p2 = m2.ports[port2];

        if (p1 == null)
            console.error(`module ${mod1} does not have port ${port1}`);
        if (p2 == null)
            console.error(`module ${mod2} does not have port ${port2}`);

        var cx1 = m1.x - m1.width  / 2;
        var cy1 = m1.y - m1.height / 2;

        var cx2 = m2.x - m2.width  / 2;
        var cy2 = m2.y - m2.height / 2;

        var x1 = cx1 + p1.x;
        var y1 = cy1 + p1.y;
        var x2 = cx2 + p2.x;
        var y2 = cy2 + p2.y;

        var l1 = connector_layer.path(`M ${x1} ${y1} R ${x1+(x2-x1)*0.25} \
            ${y1+(y2-y1)*0.25} ${x2} ${y2}`);

        l1.addClass("connector");

        connections.push([mod1, mod2, port1, port2, l1]);
    }

    function get_modules() {
        return _.cloneDeep(modules);
    }

    function remove_module(module) {

        function is_mod_con (con) {
            return (con[0] == module.id) || ([con[1]] == module.id);
        }

        var con_groups = _.groupBy(connections, is_mod_con);

        _.each(con_groups.true, (con) => con[4].remove());

        connections = con_groups.false || [];

        module.snap_group.remove();

        delete modules[module.id];
    }

    function clear() {
        _.each(modules, remove_module);
    }

    return {
        init,
        add_module,
        add_connection,
        reset_view,
        zoom_in,
        zoom_out,
        toggle_grid,
        pan,
        get_modules,
        shift_view,
        get_view_cords,
        remove_module,
        clear,
    };

})();
