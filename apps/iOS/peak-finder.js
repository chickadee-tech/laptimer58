// This ingests data and determines any new peaks in the data.

// This is based on the method outlined here: http://billauer.co.il/peakdet.html
// Eli Billauer, 3.4.05 (Explicitly not copyrighted).
// This function is released to the public domain; Any use is allowed.

'use strict';
const EventEmitter = require('events');

class PeakFinder extends EventEmitter {
  constructor() {
    super();
    this.processData = this.processData.bind(this);
    this.state = {};
    this.delta = 70;
  }

  packState(deviceId, frequency, peakY, peakX, valleyY, valleyX, lookingFor) {
    if (!(deviceId in this.state)) {
      this.state[deviceId] = {};
    }
    if (!(frequency in this.state[deviceId])) {
      this.state[deviceId][frequency] = {};
    }
    this.state[deviceId][frequency] = {"peakY": peakY,
                                       "peakX": peakX,
                                       "valleyY": valleyY,
                                       "valleyX": valleyX,
                                       "lookingFor": lookingFor};
  }

  unpackState(deviceId, frequency) {
    if (!(deviceId in this.state) || !(frequency in this.state[deviceId])) {
      return {"peakY": -Infinity,
              "peakX": 0,
              "valleyY": Infinity,
              "valleyX": 0,
              "lookingFor": "peak"};
    }
    return this.state[deviceId][frequency];
  }

  processData(deviceId, data) {
    for (let frequency of Object.keys(data)) {
      var { peakY, peakX, valleyY, valleyX, lookingFor } = this.unpackState(deviceId, frequency);
      for (var i = 0; i < data[frequency].timestamps.length; i++) {
        let y = data[frequency].strengths[i];
        let x = data[frequency].timestamps[i];

        if (y > peakY) {
          peakY = y;
          peakX = x;
        }
        if (y < valleyY) {
          valleyY = y;
          valleyX = x;
        }

        if (lookingFor === "peak") {
          if (y < peakY - this.delta) {
            this.emit("newPeak", frequency, peakX, peakY);
            valleyY = y;
            valleyX = x;
            lookingFor = "valley";
          }
        } else {
          if (y > valleyY + this.delta) {
            this.emit("newValley", frequency, valleyX, valleyY);
            peakY = y;
            peakX = x;
            lookingFor = "peak";
          }
        }
      }

      this.packState(deviceId, frequency, peakY, peakX, valleyY, valleyX, lookingFor);
    }
    //this.emit("newPeak", frequency, spike.x, spike.y);
  }
}

module.exports = PeakFinder;
