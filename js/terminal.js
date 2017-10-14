terminal = (function() {

    'use strict';

    var container;     /* top-level dev */
    var scrollable;    /* command results textarea */
    var output;        /* scrollable section containing command results */
    var prompt_input;  /* command input field */
    var terminal;      /* scrollable and input group */

    var command_callback;

    var history = {
        commands: [],
        indexer: 0,
        add: function(cmd) {
            if (cmd) {
                this.commands.push(cmd);
                this.indexer = this.commands.length;
            }
        },
        prev: function() {
            if (this.indexer > 0) this.indexer--;
            return this.commands[this.indexer] || '';
        },
        next: function() {
            if (this.indexer < this.commands.length-1) this.indexer++;
            return this.commands[this.indexer] || '';
        },
    };

    window.addEventListener("load", () => {

        container = document.querySelector("div[terminal-container]");
        terminal = container.querySelector("div[terminal]");
        scrollable = terminal.querySelector("div[scrollable]");
        output = terminal.querySelector("div[output]")
        prompt_input = terminal.querySelector("div[prompt] > input");

        prompt_input.addEventListener("keydown", keypress);

        terminal.addEventListener("mouseup", (event) => {
            var sel_range = window.getSelection().getRangeAt(0);
            var sel_len = sel_range.getClientRects().length;

            if (sel_len <= 1)
                prompt_input.focus();
        });
    });

    function append_text(type_, str_) {
        str_ = str_.replace(/</g, "&lt;");
        str_ = str_.replace(/>/g, "&gt;");
        append_html(`<b ${type_}><pre>${str_}</pre></b>`);
    }

    function append_html(html) {
        output.insertAdjacentHTML('beforeend', html);
        scroll_bottom();
    }

    function append_element(element) {
        output.append(element);
        scroll_bottom();
    }

    function append_demo_chart() {

        var data = [
        ['Number of Cores', 'Performance'],
        [ 8,      12],
        [ 4,      5.5],
        [ 11,     14],
        [ 4,      5],
        [ 3,      3.5],
        [ 6.5,    7]
        ];

        var options = {
            title: 'Average Shortest Path Computation',
            hAxis: {title: 'Number of Cores', minValue: 0, maxValue: 15},
            vAxis: {title: 'Performance (units)', minValue: 0, maxValue: 15},
            legend: 'none'
        };

        var chart_id = 1;

        append_scatter_chart(chart_id, data, options);
    }

    function append_scatter_chart(chart_id, data, options) {

        var element = document.createElement("chart");
        var data_table = google.visualization.arrayToDataTable(data);
        var chart = new google.visualization.ScatterChart(element);
        element.id = `chart_${chart_id}`;
        append_element(element);
        chart.draw(data_table, options);

    }

    function clear() {
        output.innerHTML = '';
    }

    function keypress(event) {
        if (event.code === "Enter") {
            // Enter command
            var cmd = prompt_input.value;
            prompt_input.value = "";
            append_text('cmd', `>> ${cmd}`);
            history.add(cmd);
            if (command_callback)
                command_callback(cmd);
        } else if (event.key === 'l' && event.ctrlKey) {
            // Clear console
            clear();
            event.stopPropagation();
            event.preventDefault();
        } else if (event.key === "ArrowUp") {
            prompt_input.value = history.prev();
            event.stopPropagation();
            event.preventDefault();
            prompt_input.selectionStart = prompt_input.value.length;
            prompt_input.selectionEnd = prompt_input.value.length;
        } else if (event.key === "ArrowDown") {
            prompt_input.value = history.next();
            prompt_input.selectionStart = prompt_input.value.length;
            prompt_input.selectionEnd = prompt_input.value.length;
            event.stopPropagation();
        } else if (event.code === "Escape") {
            // Hide console
            hide();
        }
    }

    function scroll_bottom() {
        scrollable.scrollTop = scrollable.scrollHeight - scrollable.clientHeight;
    }

    function hide() {
        container.classList.remove("visible");
        prompt_input.blur();
    }

    function show(maximized) {
        if (maximized)
            container.classList.add("maximized");
        else
            container.classList.remove("maximized");
        scroll_bottom();
        container.classList.add("visible");
        /* call prompt_input.focus() after animation to avoid a scrolling glitch */
        setTimeout(() => prompt_input.focus(), 150);
    }

    function set_command_callback(callback) {
        command_callback = callback;
    }

    return {show, append_html, append_text, set_command_callback};

})();
