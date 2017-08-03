terminal = (function() {

    'use strict';

    const pre_content =`
    total 56K
    drwxr-xr-x+ 1 User None    0 Aug  2 20:00 css
    drwxr-xr-x+ 1 User None    0 Aug  2 20:00 dev
    drwxr-xr-x+ 1 User None    0 Jul 25 00:17 grid_layout
    drwxr-xr-x+ 1 User None    0 Aug  2 20:00 htm
    drwxr-xr-x+ 1 User None    0 Aug  2 20:01 js
    drwxr-xr-x+ 1 User None    0 Aug  2 20:00 layout
    drwxr-xr-x+ 1 User None    0 Aug  2 20:00 logic-gates
    drwxr-xr-x+ 1 User None    0 Jul 30 21:16 node_modules
    drwxr-xr-x+ 1 User None    0 Aug  2 20:00 poets
    -rw-r--r--  1 User None   96 Jul 30 21:16 setup
    -rw-r--r--  1 User None 1.4K Aug  3 00:10 index.htm
    -rw-r--r--  1 User None 2.5K Aug  2 20:00 bs-config.js
    -rw-r--r--  1 User None   80 Aug  2 20:00 package.json
    -rw-r--r--  1 User None  159 Jun 27 22:49 README.md
    -rw-r--r--  1 User None  127 Aug  2 20:00 project.sublime-project
    -rwxr-xr-x  1 User None  27K Aug  2 00:43 project.sublime-workspace
    `;

    var container;   /* top-level dev */
    var command;     /* command input field */
    var scrollable;  /* command results textarea */
    var terminal;    /* scrollable and input group */

    function onload_handler() {
        container  = document.querySelector("div[terminal-container]");
        terminal   = container.querySelector("div[terminal]");
        command    = terminal.querySelector("input[command]");
        scrollable = terminal.querySelector("div[scrollable]");
        scrollable.innerText = pre_content;
        command.addEventListener("keydown", keypress);
    }

    window.addEventListener("load", onload_handler);

    function keypress(event) {
        if (event.code === "Enter") {
            scrollable.innerText += command.value + "\n";
            scroll_bottom();
            command.value = "";
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

    return {toggle, keypress};

})();
