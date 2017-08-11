terminal = (function() {

    'use strict';

    var container;   /* top-level dev */
    var command;     /* command input field */
    var scrollable;  /* command results textarea */
    var terminal;    /* scrollable and input group */

    var command_callback;
    var command_history = [];
    var command_history_indexer;

    var command_history = {
        history: [],
        indexer: 3,
        add: function(cmd) {
            this.history.push(cmd);
            this.indexer = this.history.length;
        },
        prev: function() {
            if (this.indexer > 0) this.indexer--;
            return this.history[this.indexer];
        },
        next: function() {
            if (this.indexer < this.history.length-1) this.indexer++;
            return this.history[this.indexer];
        },
    };

    window.addEventListener("load", () => {
        container  = document.querySelector("div[terminal-container]");
        terminal   = container.querySelector("div[terminal]");
        command    = terminal.querySelector("input[command]");
        scrollable = terminal.querySelector("div[scrollable]");
        command.addEventListener("keydown", keypress);
    });

    function append_text(type_, str_) {
        str_ = str_.replace(/</g, "&lt;");
        str_ = str_.replace(/>/g, "&gt;");
        append_html(`<b ${type_}><pre>${str_}</pre></b>`);
    }

    function append_html(html) {
        scrollable.innerHTML += html;
        scroll_bottom();
    }

    function clear() {
        scrollable.innerHTML = '';
    }

    function keypress(event) {
        if (event.code === "Enter") {
            // Enter command
            var cmd = command.value;
            command.value = "";
            append_html(`<b cmd>&raquo; ${cmd}</b>`);
            command_history.add(cmd);
            command_history_indexer = command_history.length;
            if (command_callback)
                command_callback(cmd);
        } else if (event.key === 'l' && event.ctrlKey) {
            // Clear console
            clear();
            event.stopPropagation();
            event.preventDefault();
        } else if (event.key === "ArrowUp") {
            command.value = command_history.prev();
            event.stopPropagation();
            event.preventDefault();
            command.selectionStart = command.value.length;
            command.selectionEnd = command.value.length;
        } else if (event.key === "ArrowDown") {
            command.value = command_history.next();
            command.selectionStart = command.value.length;
            command.selectionEnd = command.value.length;
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
        command.blur();
    }

    function show(maximized) {
        if (maximized)
            container.classList.add("maximized");
        else
            container.classList.remove("maximized");
        scroll_bottom();
        container.classList.add("visible");
        /* call command.focus() after animation to avoid a scrolling glitch */
        setTimeout(() => command.focus(), 150);
    }

    function set_command_callback(callback) {
        command_callback = callback;
    }

    return {show, append_html, append_text, set_command_callback};

})();
