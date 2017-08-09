terminal = (function() {

    'use strict';

    const pre_content =``;

    var container;   /* top-level dev */
    var command;     /* command input field */
    var scrollable;  /* command results textarea */
    var terminal;    /* scrollable and input group */

    function onload_handler() {
        container  = document.querySelector("div[terminal-container]");
        terminal   = container.querySelector("div[terminal]");
        command    = terminal.querySelector("input[command]");
        scrollable = terminal.querySelector("div[scrollable]");
        scrollable.innerHTML = pre_content;
        command.addEventListener("keydown", keypress);
    }

    window.addEventListener("load", onload_handler);

    function keypress(event) {
        if (event.code === "Enter") {
            var cmd = command.value;
            scrollable.innerHTML += `<b cmd>&raquo; ${cmd}</b>`;
            scroll_bottom();
            command.value = "";
            sio.call(cmd, {}, (response) => {
                var new_html;
                if (response.result === "success") {
                    if (_.isString(response.return)) {
                        new_html = `<b response>${response.return}</b>`;
                    } else {
                        var response_str = JSON.stringify(response.return, null, '  ');
                        new_html = `<b response><pre>${response_str}</pre></b>`;
                    }
                } else {
                    new_html = `<b error>${response.description}</b>`;
                }
                scrollable.innerHTML += new_html;
                scroll_bottom();
            });
        }
        if (event.code === "Escape")
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

    return {show};

})();
