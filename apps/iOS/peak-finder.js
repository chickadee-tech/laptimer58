// This ingests data and determines any new peaks in the data.

'use strict';
const EventEmitter = require('events');

class PeakFinder extends EventEmitter {
  constructor() {
    super();
    this.processData = this.processData.bind(this);
  }

  processData(deviceId, data) {
    //this.emit("newPeak", frequency, spike.x, spike.y);
  }
}

module.exports = PeakFinder;
