var vetrina = (function () {

    'use strict';

    var pre_x; // x coord of view, before palette change shift view
    var pre_y; // y coord of view, before palette change shift view
    var cmd_counter = 1;

    function show_palette_components() {

        [pre_x, pre_y] = viewer.get_view_cords();

        var change_callback = (selected) => {
            if (selected) {
                viewer.shift_view(selected.x, selected.y);
            }
        };

        var select_callback = (selected) => {
            // todo
        };

        var cancel_callback = (selected) => {
            viewer.shift_view(pre_x, pre_y);
        }

        var mods = viewer.get_modules();

        var items = _.map(mods, (value, key) => _.assign({label: key}, value) );

        return palette.show(items, change_callback, select_callback, cancel_callback);
    }

    function oncommand(cmd) {

        // terminal command handler

        var response_id = cmd_counter++;

        sio.evaluate(cmd, (response) => {

            var response_type = response.type || "text";

            if (response_type === "chart") {

                // handle responses with chart payload

                var chart_id = response_id;

                if (response.result === "success" || response.result === "update") {

                    if (!charts.exists(chart_id))
                        terminal.append_element(charts.make(chart_id));

                    charts.draw(chart_id, response.return.data,
                        response.return.options);

                } else {

                    terminal.append_text('error', response.description);

                }

            } else if (response_type === "text") {

                // handle responses with text payload

                if (response.result === "success" && response.return) {

                    terminal.append_text("response", response.return, response_id);

                } else if (response.result === "update") {

                    terminal.append_text("update", response.return, response_id);

                } else if (response.result === "error") {

                    terminal.append_text('error', response.description);
                }

            } else if (response_type === "json") {

                // handle responses with json payload

                var json_str = JSON.stringify(response.return, null, '  ');

                if (response.result === "success" && json_str) {

                    terminal.append_text("response", json_str, response_id);

                } else if (response.result === "update") {

                    terminal.append_text("update", json_str, response_id);

                } else if (response.result === "error") {

                    terminal.append_text('error', response.description);
                }

            } else if (response_type === "download") {

                download(response.return.content, response.return.filename,
                    "text/plain");

            } else {

                // unrecognized response type

                terminal.append_text('error',
                    `engine response has an unrecognized type ${response.type}`);

                return; // abort processing current response

            }

            // update current model if responses has a 'state' field

            if (response.state) {
                viewer.clear();
                _.each(response.state.modules, viewer.add_module);
                _.each(response.state.connections, viewer.add_connection);
            }

        });
    }

    function onconnect() {
        sio.get("engine_name", (response) => {
            var success = response.result === 'success';
            var name_str = success ? `(${response.return})` : '';
            toaster.success(`Engine connected ${name_str}`);
            sio.evaluate("model = init()");
        });
    }

    function ondisconnect() {
        toaster.error('Engine disconnected');
    }

    function onload() {

        viewer.init("svg[viewer]");

        terminal.set_command_callback(oncommand);

        setTimeout(() => sio.connect(onconnect, ondisconnect), 500);

        terminal.show();

        // Show viewer demo if URL contains '?demo'

        var is_demo = document.URL.indexOf('?demo') != -1;

        if (is_demo) {
            const preset = demos.get_viewer_demo();
            _.each(preset.modules, viewer.add_module);
            _.each(preset.connections, viewer.add_connection);
        }

    };

    window.addEventListener("load", onload);

    return {
        show_palette_components
    };

})();
