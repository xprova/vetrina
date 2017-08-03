terminal = (function() {

'use strict';

function keypress(event) {
    var elem = document.getElementById("input1");
    var content = document.querySelector(".content1");
    if (event.code === "Enter") {
        content.innerText += elem.value + "\n";
        scroll_bottom();
        elem.value = "";
    }
    if (event.code === "Escape")
        toggle();
}

function scroll_bottom() {
    var terminal = document.querySelector(".inner1");
    terminal.scrollTop = terminal.scrollHeight - terminal.clientHeight;
}

function toggle() {
    var inp = document.getElementById("input1");
    var container = document.querySelector(".terminal-container");
    var cur_visible = container.classList.contains("visible");
    if (cur_visible) {
        container.style.visiblility = 'visible';
        container.classList.remove("visible");
        container.classList.add("invisible");
        inp.blur();
    } else {
        scroll_bottom();
        container.style.visiblility = 'visible';
        container.classList.add("visible");
        container.classList.remove("invisible");
        /* call inp.focus() after animation to avoid a scroll glitch */
        setTimeout(() => inp.focus(), 150);
    }
}

return {
    toggle: toggle,
    keypress: keypress,
}

})();
