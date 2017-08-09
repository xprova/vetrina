(function(viewer, palette, terminal) {

    'use strict';

    if (viewer == null)
        console.error("viewer is undefined");
    if (palette == null)
        console.error("palette is undefined");
    if (terminal == null)
        console.error("terminal is undefined");

    var actions = {
        'maximize_terminal'    : (e) => terminal.maximize(),
        'pan_down'             : (e) => viewer.pan('down'),
        'pan_left'             : (e) => viewer.pan('left'),
        'pan_right'            : (e) => viewer.pan('right'),
        'pan_up'               : (e) => viewer.pan('up'),
        'reset_view'           : (e) => viewer.reset_view(),
        'restore_terminal'     : (e) => terminal.restore(),
        'show_palette'         : (e) => app.show_palette_components(),
        'show_terminal'        : (e) => terminal.show(),
        'show_terminal_max'    : (e) => terminal.show(true),
        'toggle_grid'          : (e) => viewer.toggle_grid(),
        'zoom_in'              : (e) => viewer.zoom_in(),
        'zoom_out'             : (e) => viewer.zoom_out(),
    };

    var bindings = [
        {'keys' : '0'        , 'command': 'reset_view'},
        {'keys' : ['+', '='] , 'command': 'zoom_in'},
        {'keys' : '-'        , 'command': 'zoom_out'},
        {'keys' : 'g'        , 'command': 'toggle_grid'},
        {'keys' : 'right'    , 'command': 'pan_right'},
        {'keys' : 'left'     , 'command': 'pan_left'},
        {'keys' : 'down'     , 'command': 'pan_down'},
        {'keys' : 'up'       , 'command': 'pan_up'},
        {'keys' : 'ctrl+p'   , 'command': 'show_palette'},
        {'keys' : "'"        , 'command': 'show_terminal'},
        {'keys' : "#"        , 'command': 'show_terminal_max'},
    ];

    _.map(bindings, item => Mousetrap.bind(item.keys, actions[item.command]));

})(viewer, palette, terminal);
