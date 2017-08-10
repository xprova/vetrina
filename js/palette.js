palette = (function() {

'use strict';

var items; // palette item list
var palette; // palette dom object
var painput; // palette input dom object
var change_callback; // callback for when selected item changes
var select_callback; // callback for pressing Enter on selected item
var cancel_callback; // callback for cancelling palette
var change_callback_last_obj; // object that change_cb was fired upon last

var module = angular.module('project', []);

window.addEventListener("load", () => {
    palette = document.querySelector('#palette');
    painput = document.querySelector('#palette-input');
});

function show(items_, change_cb, select_cb, cancel_cb) {
    // set items and callbacks
    items = items_;
    change_callback = change_cb;
    select_callback = select_cb;
    cancel_callback = cancel_cb;
    // start show animation
    palette.classList.add('visible');
    // update item list
    var scope = angular.element(painput).scope();
    scope.$apply(function() {
        scope.query = '';
        scope.onQueryChange();
    });
    painput.focus();
    return false;
}

function hide() {
    palette.classList.remove('visible');
    return false;
}

function paletteController($scope, $sce) {

    var max_results = 200;

    $scope.query = "";
    $scope.matching_items = items;
    $scope.selected = 1;

    function fuzzy_match(term, text) {

        term = term.toLowerCase();
        text = text.toLowerCase();

        term = term.replace(/[ ]/g, "");

        var j = 0; // term index
        var dist = 0; // distance since last matched char
        var len = text.length; // grab this in a local var for performance
        var points = 0;
        var indices = [];

        for (var i=0; i<len; i++) {
            if (text[i] == term[j]) {
                points += 10 - dist;
                indices.push(i);
                j += 1;
                dist = 0;
            } else {
                dist += 1;
            }
        }

        var match = j == term.length;

        return match ? {points: points, indices: indices} : null;

    }

    function change_cb_wrapper() {

        // call change_callback, if necessary

        var new_sel_obj = $scope.matching_items[$scope.selected];
        var objected_changed = new_sel_obj !== change_callback_last_obj;

        if (change_callback && objected_changed)
            change_callback(new_sel_obj);

        change_callback_last_obj = new_sel_obj;

    }

    $scope.onQueryChange = function() {

        var fuzzy_m = (item) => fuzzy_match($scope.query, item["label"]);

        var results = _.map(items, fuzzy_m);

        $scope.matching_items = _
        .chain(items)
        .zip(results)
        .filter(e => e[1] != null) // remove mismatches
        .map(e => _.extend(e[0], e[1]))
        .value();

        $scope.selected = 0;
        var results = document.querySelector("#results");
        results.scrollTop = 0;

        change_cb_wrapper();

    }

    $scope.select_item = function(index) {
        $scope.selected = index;
    }

    function scroll_to_selected_item(downwards) {

        var elem0 = document.querySelector("#item_0");
        var results = document.querySelector("#results");

        var itemH = elem0.getBoundingClientRect().height;
        var top = results.scrollTop;
        var bottom = top + results.getBoundingClientRect().height;
        var first = Math.ceil(top / itemH);
        var last = Math.floor(bottom / itemH) - 1;

        if (downwards && last < $scope.selected)
            results.scrollTop += itemH;
        else if (!downwards && first > $scope.selected)
            results.scrollTop -= itemH;

    }

    $scope.input_keypress = function(e) {

        if (e.key === "ArrowDown") {
            $scope.selected = Math.min($scope.matching_items.length-1, $scope.selected + 1);
            scroll_to_selected_item(true);
            change_cb_wrapper();
        } else if (e.key === "ArrowUp") {
            $scope.selected = Math.max(0, $scope.selected - 1);
            scroll_to_selected_item(false);
            change_cb_wrapper();
        } else if (e.key === "Enter") {
            hide();
            var painput = document.querySelector('#palette-input');
            painput.blur(); // move focus away to avoid capturing future keystrokes
            var selected_object = $scope.matching_items[$scope.selected]
            if (select_callback && select_callback)
                select_callback(selected_object);
            else
                cancel_callback();
        } else if (e.key === "Escape") {
            hide();
            var painput = document.querySelector('#palette-input');
            painput.blur(); // move focus away to avoid capturing future keystrokes
            if (cancel_callback)
                cancel_callback($scope.matching_items[$scope.selected]);
        }
        return false;
    }

    $scope.highlight = function(item) {

        var new_label = _.map(item.label, function (chr, ind, chrs) {

            var char_exists = item.indices.indexOf(ind) != -1;
            var prev_char_exists = item.indices.indexOf(ind-1) != -1;
            var last_char = ind == item.label.length;

            var term_chr = (last_char && prev_char_exists) ? (chr + "</b>") : chr;

            if (char_exists)
                return prev_char_exists ? term_chr : ("<b>" + term_chr);
            else
                return prev_char_exists ? ("</b>" + term_chr) : term_chr;

        }).join("");

        return $sce.trustAsHtml(new_label);
    }

    $scope.onQueryChange();

}

module.directive('palette', () => ({
    templateUrl: 'htm/palette.htm',
    controller: paletteController,
}));

return {
    show,
    hide,
};

})();
