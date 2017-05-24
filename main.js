var snap;

var x = 0;

function timer1_callback() {

    // snap.attr({viewBox: "00, 100, 500, 500"})

    y = 0; w = 500; h = 500;

    x += 0.1;

    xshift = x % 200;
    xshift = 0;

    snap.attr({viewBox: [xshift, xshift, w, h].join(',')});

}

Mousetrap.bind('0', function() {
    shift_view(0, 0);
    return false;
});

Mousetrap.bind('1', function() {
    snap.attr({viewBox: "0, 0, 500, 500"});
});

var shift = {x:0, y:0};

var drag_start = null;
var shift_anchor = null;

function shift_view(x, y) {

    w = h = 700;

    snap.attr({viewBox: [x, y, w, h].join(',')});

    shift = {x: x, y: y};
}

window.onload = function () {

    snap = Snap(700, 700);

    snap.mousedown(function(e) {

        drag_start = {x: e.x, y: e.y};
        shift_anchor = {x: shift.x, y:shift.y};

    });

    snap.mousemove(function(e) {

        if (e.buttons == 1) {

            new_x = shift_anchor.x - (e.x - drag_start.x);
            new_y = shift_anchor.y - (e.y - drag_start.y);

            shift_view(new_x, new_y);

        }

    });

    for (var i = -10; i<50; i++) {

        var xi = i * 20;

        var line1 = snap.line(xi, 0, xi, 500).attr({stroke: '#eeeeee'});
        var line2 = snap.line(0, xi, 500, xi).attr({stroke: '#eeeeee'});

    }

    var r1 = snap.rect(60, 60, 100, 100, 5, 5).attr({fill: 'white', stroke: 'black'});

    var t1 = snap.text(110, 180, "norGate1");

    t1.attr({
        fontFamily: "Rambla",
        textAnchor: "Middle",
        alignmentBaseline: "central"
    });

    // console.log(t1.attr());
    // console.log(snap.outerSVG());

    // window.setInterval(timer1_callback, 10);

};
