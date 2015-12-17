'use strict';

var gnuplot = require('gnuplot');

class DebugChart {
  constructor() {
    this.processData = this.processData.bind(this);
    this.processPeak = this.processPeak.bind(this);
    this.processSmoothedData = this.processSmoothedData.bind(this);
    this.plot = gnuplot().set('term png size 3000, 1500')
                         .set('output "data.png"')
                         .set('title "Some Math Functions"')
                         .set('zeroaxis');
    this.data = {};
    this.smoothedData = {};
    this.peaks = {};
  }

  processData(deviceId, data) {
    if (!(deviceId in this.data)) {
      this.data[deviceId] = {};
    }
    for (let frequency of Object.keys(data)) {
      if (!(frequency in this.data[deviceId])) {
        this.data[deviceId][frequency] = [];
      }
      for (let i = 0; i < data[frequency].timestamps.length; i++) {
        this.data[deviceId][frequency].push(data[frequency].timestamps[i] + " " + data[frequency].strengths[i]);
      }
    }
  }

  processPeak(frequency, timestamp, strength) {
    if (!(frequency in this.peaks)) {
      this.peaks[frequency] = [];
    }
    this.peaks[frequency].push(timestamp + " " + strength);
  }

  processSmoothedData(deviceId, data) {
    if (!(deviceId in this.smoothedData)) {
      this.smoothedData[deviceId] = {};
    }
    for (let frequency of Object.keys(data)) {
      if (!(frequency in this.smoothedData[deviceId])) {
        this.smoothedData[deviceId][frequency] = [];
      }
      for (let i = 0; i < data[frequency].timestamps.length; i++) {
        this.smoothedData[deviceId][frequency].push(data[frequency].timestamps[i] + " " + data[frequency].strengths[i]);
      }
    }
  }

  done() {
    // Print the plot commands first.
    let graphs = [];
    for (let device of Object.keys(this.data)) {
      for (let frequency of Object.keys(this.data[device])) {
        graphs.push(device + " - " + frequency);
      }
    }
    // Plot commands for raw data.
    for (var i = 0; i < graphs.length; i++) {
      let start = ",  ";
      if (i === 0) {
        start = "plot";
      }
      this.plot.print(start + " '-' using 1:2 title \"" + graphs[i] + "\" with points pt 1");
    }
    // Plot commands for smoothed data.
    for (var i = 0; i < graphs.length; i++) {
      this.plot.print(",   '-' using 1:2 title \"" + graphs[i] + "\" with lines");
    }
    // Plot commands for peaks.
    let frequencies = Object.keys(this.peaks);
    for (var i = 0; i < frequencies.length; i++) {
      this.plot.print(",    '-' using 1:2 title \"" + frequencies[i] + "\" with points pt 7 ps 8");
    }
    this.plot.println("");
    // Print the data.
    for (let device of Object.keys(this.data)) {
      for (let frequency of Object.keys(this.data[device])) {
        this.data[device][frequency].push("e");
        this.plot.println(this.data[device][frequency].join("\n  "));
      }
    }
    for (let device of Object.keys(this.smoothedData)) {
      for (let frequency of Object.keys(this.smoothedData[device])) {
        this.smoothedData[device][frequency].push("e");
        this.plot.println(this.smoothedData[device][frequency].join("\n  "));
      }
    }
    for (let frequency of frequencies) {
      this.peaks[frequency].push("e");
      this.plot.println(this.peaks[frequency].join("\n  "));
    }
    this.plot.end();
  }
}

module.exports = DebugChart;
