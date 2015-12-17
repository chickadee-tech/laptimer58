'use strict';
const EventEmitter = require('events');
var jsonfile = require('jsonfile');

class LogReader extends EventEmitter {
  constructor(log_filenames) {
    super();
    this.logs = [];
    for (let filename of log_filenames) {
      this.logs.push(jsonfile.readFileSync(filename));
    }
  }

  _indexValid(currentValue, index, array) {
    return currentValue < this.logs[index].frame_groups.length;
  }

  start() {
    let indices = [];
    for (var i = 0; i < this.logs.length; i++) {
      indices.push(0);
    }

    while (indices.some(this._indexValid, this)) {
      let next_log = 0;
      for (var i = 0; i < this.logs.length; i++) {
        if (this._indexValid(indices[i], i, indices)) {
          next_log = i;
          break;
        }
      }
      let next_time = this.logs[next_log].frame_groups[indices[next_log]].received;
      for (var i = 1; i < this.logs.length; i++) {
        if (!this._indexValid(indices[i], i, indices)) {
          continue;
        }
        let next_frame_group_time = this.logs[i].frame_groups[indices[i]].received;
        if (next_frame_group_time < next_time) {
          next_time = next_frame_group_time;
          next_log = i;
        }
      }
      let output = {};
      let frames = this.logs[next_log].frame_groups[indices[next_log]].frames;
      for (let frame of frames) {
        let frequency = frame.frequency;
        if (!(frequency in output)) {
          output[frequency] = {"strengths": [], "timestamps": []}
        }
        output[frequency].strengths.push(frame.strength);
        output[frequency].timestamps.push(frame.timestamp);
      }
      let deviceId = this.logs[next_log].chip_id;
      this.emit("newData", deviceId, output);
      indices[next_log]++;
    }
  }

  stop() {
  }

  tcpReceivedData(packet) {
    let data = packet.data;
    let deviceId = data.readUInt32BE(0);
    let offset = 4;
    let output = {};
    while (offset < data.length) {
      let iteration = data.readUInt8(offset);
      let timestamp = data.readUInt32BE(offset + 1);
      let frequency = data.readUInt16BE(offset + 5);
      let strength = data.readUInt16BE(offset + 7);
      offset += 9;
      //console.log(iteration, timestamp, frequency, strength);

      if (!(frequency in output)) {
        output[frequency] = {"strengths": [], "timestamps": []}
      }
      output[frequency].strengths.push(strength);
      output[frequency].timestamps.push(timestamp);
    }
    this.emit("newData", deviceId, output);
  }
}

module.exports = LogReader;
