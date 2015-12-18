// This logs received data for later replay.
'use strict';
const EventEmitter = require('events');

var RNFS = require('react-native-fs');

class Logger extends EventEmitter {
  constructor() {
    super();
    this.processData = this.processData.bind(this);
    this.writeFile = this.writeFile.bind(this);

    // create a path you want to write to
    var now = new Date();
    this.path = RNFS.DocumentDirectoryPath + '/ckd-lt58-' + now.getFullYear() + (now.getMonth() + 1) + now.getDate() + "_" + now.getHours() + now.getMinutes() + ".json";

    this.data = [];
    this.deviceMapping = {};
  }

  compareByTimestamp(a, b) {
    return a.timestamp - b.timestamp;
  }

  processData(deviceId, data) {
    var now = new Date();
    if (!(deviceId in this.deviceMapping)) {
      this.deviceMapping[deviceId] = this.data.length;
      this.data.push({"chip_id": deviceId, "frame_groups": []});
    }
    var frames = [];
    var frame_group = {"received": now.getTime() / 1000, "frames": frames};
    this.data[this.deviceMapping[deviceId]].frame_groups.push(frame_group);
    for (let frequency of Object.keys(data)) {
      for (var i = 0; i < data[frequency].timestamps.length; i++) {
        frames.push({"iteration": 0,
                     "timestamp": data[frequency].timestamps[i],
                     "frequency": frequency,
                     "strength": data[frequency].strengths[i]});
      }
    }
    // TODO(tannewt): Remove this sort by changing the loop above because its a
    // predictable pattern.
    frames.sort(this.compareByTimestamp);
  }

  writeFile() {
    console.log("attempting file write");
    RNFS.writeFile(this.path, JSON.stringify(this.data), 'utf8')
      .then((success) => {
        console.log("success");
        this.emit("logWritten");
      })
      .catch((err) => {
        console.log("failure");
        this.emit("logWriteFailed");
      });
  }
}

module.exports = Logger;
