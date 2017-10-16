terminal = (function() {

    'use strict';

    var container;     /* top-level dev */
    var scrollable;    /* command results textarea */
    var output;        /* scrollable section containing command results */
    var prompt_input;  /* command input field */
    var terminal;      /* scrollable and input group */

    var command_callback;
    var output_objs = {}; // id -> output DOM elem

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

    var replace_dom_element = function (el1, el2) {

        var parent = el1.parentNode;
        if (!parent) return false;

        parent.replaceChild(el2, el1);

        return el2;
    }

    function append_text(type_, str_, id) {

        var elem = create_text_element(type_, str_);

        if (id) {

            // identity specified

            var existing_obj = output_objs[id];

            if (existing_obj) {

                // object with same id exists, replace with new object

                replace_dom_element(existing_obj, elem);

            } else {

                // new id, just append object to output

                append_element(elem);
            }

            // whether object was appended or replaced, store in output_objs
            // for book-keeping

            output_objs[id] = elem;

        } else {

            // no id specified, add to output

            append_element(elem);
        }

    }

    function create_text_element(type_, str_) {

        // Create and return a console log text element in the form:
        //
        // <b type_ id="%ID"><pre>Text</pre></b>
        //
        // where %ID = resp_${id}

        var b_elem = document.createElement("b");
        var p_elem = document.createElement("pre");

        b_elem.setAttribute(type_, ''); // add type attribute (with no value)
        p_elem.innerText = str_; // set <pre> content

        b_elem.appendChild(p_elem);

        return b_elem;
    }

    function append_element(element) {
        output.append(element);
        scroll_bottom();
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

    return {
        show,
        append_text,
        append_element,
        set_command_callback
    };

})();
