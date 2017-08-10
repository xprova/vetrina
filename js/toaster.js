var toaster = (function () {

    var counter = 0; // number of visible toasts

    const duration_visible = 2500; // how long is toast on screen
    const duration_cooldown = 500; // how long toast holds position after hiding

    /*
    Note that toasts continue to exist for a short duration after hiding. This
    is so that future toasts appear below and don't move upwards. Toasts are
    cleared only after all have been hidden for at least `duration_cooldown`.
    */

    function show(text, icon, class_) {
        icon = icon || '';
        var container = document.querySelector("toaster");
        var new_toast = document.createElement("toast");
        new_toast.innerHTML = `<icon>${icon}</icon>${text}`;
        if (class_) new_toast.classList.add(class_);
        container.append(new_toast);
        counter += 1;
        window.setTimeout(() => new_toast.classList.add('show'), 10);
        window.setTimeout(() => new_toast.classList.remove('show'), duration_visible);
        window.setTimeout(() => {
            counter -= 1;
            if (counter == 0) container.innerHTML = '';
        }, duration_visible + duration_cooldown);
    }

    function success(text) {
        show(text, 'done', 'success');
    }

    function error(text) {
        show(text, 'error_outline', 'error');
    }

    function info(text) {
        show(text, 'info_outline');
    }

    return {show, success, error, info};

})();