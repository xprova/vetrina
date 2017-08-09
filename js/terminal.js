terminal = (function() {

    'use strict';

    var container;   /* top-level dev */
    var command;     /* command input field */
    var scrollable;  /* command results textarea */
    var terminal;    /* scrollable and input group */

    var command_callback;

    function onload_handler() {
        container  = document.querySelector("div[terminal-container]");
        terminal   = container.querySelector("div[terminal]");
        command    = terminal.querySelector("input[command]");
        scrollable = terminal.querySelector("div[scrollable]");
        command.addEventListener("keydown", keypress);
    }

    window.addEventListener("load", onload_handler);

    function append(html) {
        scrollable.innerHTML += html;
        scroll_bottom();
    }

    function keypress(event) {
        if (event.code === "Enter") {
            var cmd = command.value;
            command.value = "";
            append(`<b cmd>&raquo; ${cmd}</b>`);
            if (command_callback)
                command_callback(cmd);
        } else if (event.code === "Escape")
            hide();
    }

    function scroll_bottom() {
        scrollable.scrollTop = scrollable.scrollHeight - scrollable.clientHeight;
    }

    function hide() {
        container.classList.remove("visible");
        container.classList.add("invisible");
        command.blur();
    }

    function show(maximized) {
        if (maximized)
            container.classList.add("maximized");
        else
            container.classList.remove("maximized");
        scroll_bottom();
        container.classList.add("visible");
        container.classList.remove("invisible");
        /* call command.focus() after animation to avoid a scroll glitch */
        setTimeout(() => command.focus(), 150);
    }

    function set_command_callback(callback) {
        command_callback = callback;
    }

    return {show, append, set_command_callback};

})();
