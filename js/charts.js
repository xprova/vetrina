var charts = (function() {

	'use strict';

	var chart_objs = {};

	/*
	 * Basic procedure to draw a chart:
	 *
	 * 1. Call charts.make() with a unique id, grab returned DOM element.
	 * 2. Place DOM element whenever you want the chart to be displayed.
	 * 3. Call charts.draw() passing in chart id, data and options.
	 *
	 */

	 function make(chart_id) {

		// Create chart with given id.

		if (exists(chart_id)) {
			console.error(`chart with id ${chart_id} already exists`);
		} else {
			var element = document.createElement("chart");
			var chart = new google.visualization.ScatterChart(element);
			chart_objs[chart_id] = chart;
			return element;
		}

	}

	function draw_demo(chart_id) {

		// Draw demo plot on chart with give id.

		var data = [
		['Number of Cores', 'Performance'],
		[ 8,      12],
		[ 4,      5.5],
		[ 11,     14],
		[ 4,      5],
		[ 3,      3.5],
		[ 6.5,    7]
		];

		var options = {
			title: 'Average Shortest Path Computation',
			hAxis: {title: 'Number of Cores', minValue: 0, maxValue: 15},
			vAxis: {title: 'Performance (units)', minValue: 0, maxValue: 15},
			legend: 'none'
		};

		draw(chart_id, data, options);

	}

	function exists(chart_id) {

		// Return true is chart with given id exists, false otherwise.

		return chart_objs[chart_id] != undefined;

	}

	function draw(chart_id, data, options) {

		// Draw `data` with given `options` on chart with given id.

		var chart = chart_objs[chart_id];

		if (chart) {
			var data_table = google.visualization.arrayToDataTable(data);
			chart.draw(data_table, options);
		} else {
			console.error("No chart with id = " + chart_id);
		}

	}

	// exports

	return {make, exists, draw, draw_demo};

})();