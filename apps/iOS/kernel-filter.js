// This filter smooths the signal. This is OK because we are looking for the
// overall peak trend rather than the exact signal peak.

'use strict';
const EventEmitter = require('events');
var kernel = require('kernel-smooth');

class KernelFilter extends EventEmitter {
  constructor() {
    super();
    this.processData = this.processData.bind(this);
  }

  processData(deviceId, data) {
    // emit newData
    //console.log(data);
    let smoothedData = {};
    for (let frequency of Object.keys(data)) {
      if (!(frequency in smoothedData)) {
        smoothedData[frequency] = {"timestamps": data[frequency].timestamps, "strengths": []};
      }
      //let bandwidth = kernel.silverman(data[frequency].timestamps);
      let bandwidth = 1000;
      var f_hat = kernel.regression(data[frequency].timestamps, data[frequency].strengths, kernel.fun.epanechnikov, bandwidth);
      for (let i = 0; i < data[frequency].timestamps.length; i++) {
        smoothedData[frequency].strengths.push(f_hat(data[frequency].timestamps[i]));
      }
    }
    this.emit("newData", deviceId, smoothedData);
  }
}

module.exports = KernelFilter;
