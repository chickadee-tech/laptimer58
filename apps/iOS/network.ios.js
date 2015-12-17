'use strict';
const EventEmitter = require('events');

var dgram = require('react-native-udp');
var TCPSocket = require('RCTTCPSocket/TCPSocket.ios');
global.Buffer = global.Buffer || require('buffer').Buffer;

var PACKET_TYPE_I_AM_AP = 3;

class Network extends EventEmitter {
  start() {
    this.udp = dgram.createSocket("udp4");
    this.udp.bind(59734);
    this.udp.once("listening", function() {
      this.udp.addMembership("239.249.134.147");

      var buf = new Uint8Array(1);
      buf[0] = 1;
      this.udp.send(buf, 0, buf.length, 59734, "239.249.134.147", function(err) {
        if (err) throw err;
      });
    }.bind(this));
    this.udp.on("message", function(message, rinfo) {
      //console.log("message", message.readUInt8(0), message.readUInt32BE(1), message.readUInt16BE(5), message.readUInt16BE(7));
      var packet_type = message.readUInt8(0);
      if (packet_type === PACKET_TYPE_I_AM_AP) {
        var tcp_port = message.readUInt16LE(2);
        this.tcp = new TCPSocket(rinfo.address, tcp_port);
        this.tcp.onopen = this.tcpOpened.bind(this);
        this.tcp.ondata = this.tcpReceivedData.bind(this);
        this.tcp.onerror = this.tcpError.bind(this);
        this.tcp.onclose = this.tcpClosed.bind(this);
      }
    }.bind(this));
    this.udp.on("error", console.log);
  }

  stop() {
    this.udp.close();
    this.udp = null;
    if (this.tcp) {
      this.tcp.close();
      this.tcp = null;
    }
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
    this.emit("connectionLost");
    console.log("TCP Error", error)
  }

  tcpClosed() {
    this.emit("connectionLost");
    console.log("TCP connection closed.");
  }
}

module.exports = Network;
