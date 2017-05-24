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

window.onload = function () {

    snap = Snap(700, 700);

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

    window.setInterval(timer1_callback, 10);

};
