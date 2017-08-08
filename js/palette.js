palette = (function() {

'use strict';

var module = angular.module('project', []);

var items;
var select_callback;

function hide() {
    return toggle(false);
}

function show(items_, select_callback_, cancel_callback) {
    items = items_;
    select_callback = select_callback_;
    return toggle(true);
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
            return false;
        } else if (e.key === "ArrowUp") {
            $scope.selected = Math.max(0, $scope.selected - 1);
            scroll_to_selected_item(false);
            return false;
        } else if (e.key === "Enter" || e.key === "Escape") {
            var painput = document.querySelector('#palette-input');
            toggle(false);
            painput.blur(); // move focus away to avoid capturing future keystrokes
            if (e.key === "Enter")
                select_callback($scope.matching_items[$scope.selected]);
            return false;
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

function toggle(visible) {

    var palette = document.querySelector('#palette');
    var painput = document.querySelector('#palette-input');
    var current_visible = palette.classList.contains('visible');

    if (visible === undefined)
        var visible = !current_visible;

    if (visible && !current_visible) {
        palette.classList.add('visible');
        palette.classList.remove('invisible');
        var scope = angular.element(painput).scope();
        scope.$apply(function() {
            scope.query = '';
            scope.onQueryChange();
        });
        painput.focus();
    } else if (!visible && current_visible) {
        palette.classList.add('invisible');
        palette.classList.remove('visible');
    }

    return false;
}

return {
    show,
    hide,
    toggle,
};

})();
