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
            sio.send({"call": cmd}, (response) => {
                if (response.hasOwnProperty("success")) {
                    scrollable.innerHTML += `<b response>${response.result}</b>`;
                } else {
                    scrollable.innerHTML += `<b error>${response.description}</b>`;
                }
                scroll_bottom();
            });
        }
        if (event.code === "Escape")
            toggle();
    }

    function scroll_bottom() {
        scrollable.scrollTop = scrollable.scrollHeight - scrollable.clientHeight;
    }

    function toggle() {
        var cur_visible = container.classList.contains("visible");
        if (cur_visible) {
            container.style.visiblility = 'visible';
            container.classList.remove("visible");
            container.classList.add("invisible");
            command.blur();
        } else {
            scroll_bottom();
            container.style.visiblility = 'visible';
            container.classList.add("visible");
            container.classList.remove("invisible");
            /* call command.focus() after animation to avoid a scroll glitch */
            setTimeout(() => command.focus(), 150);
        }
    }

    return {toggle};

})();
