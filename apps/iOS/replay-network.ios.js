'use strict';

// This is a debug network source that connects to a local Python server rather
// than real devices.
const EventEmitter = require('events');

var TCPSocket = require('RCTTCPSocket/TCPSocket.ios');
global.Buffer = global.Buffer || require('buffer').Buffer;

class ReplayNetwork extends EventEmitter {
  start() {
    this.tcp = new TCPSocket("localhost", 7000);
    this.tcp.onopen = this.tcpOpened.bind(this);
    this.tcp.ondata = this.tcpReceivedData.bind(this);
    this.tcp.onerror = this.tcpError.bind(this);
    this.tcp.onclose = this.tcpClosed.bind(this);
  }

  stop() {
    this.tcp.close();
    this.tcp = null;
  }

  tcpOpened() {
    console.log("TCP successfully opened.");
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

  tcpError(error) {
    console.log("TCP Error", error);
      this.emit("connectionLost");
  }

  tcpClosed() {
    this.emit("connectionLost");
    console.log("TCP connection closed.");
  }
}

module.exports = ReplayNetwork;
