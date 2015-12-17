// node replay.js ../../tools/logs/2015/12/4/1216_50331675.json

var DebugChart = require('./debug-chart');
var LogReader = require('./log-reader');
var KernelFilter = require('./kernel-filter');
var PeakFinder = require('./peak-finder');

var reader = new LogReader(process.argv.slice(2));
var kernel_filter = new KernelFilter();
var debug_chart = new DebugChart();
reader.addListener("newData", kernel_filter.processData);
reader.addListener("newData", debug_chart.processData);
var peak_finder = new PeakFinder();
kernel_filter.addListener("newData", peak_finder.processData);
kernel_filter.addListener("newData", debug_chart.processSmoothedData);
//peak_finder.addListener("newPeak", console.log);
peak_finder.addListener("newPeak", debug_chart.processPeak);
reader.start();
debug_chart.done();
