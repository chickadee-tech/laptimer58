'use strict';
const EventEmitter = require('events');

var dgram = require('react-native-udp');
var TCPSocket = require('RCTTCPSocket/TCPSocket.ios');
global.Buffer = global.Buffer || require('buffer').Buffer;

var PACKET_TYPE_I_AM_AP = 3;

class Network extends EventEmitter {
  start() {
    console.log("start");
    this.udp = dgram.createSocket("udp4");
    this.udp.bind(59734);
    this.udp.once("listening", function() {
      this.udp.addMembership("239.249.134.147");
      console.log("joined group");

      var buf = new Uint8Array(1);
      buf[0] = 1;
      this.udp.send(buf, 0, buf.length, 59734, "239.249.134.147", function(err) {
        if (err) throw err;

        console.log('message was sent');
      });
    }.bind(this));
    this.udp.on("message", function(message, rinfo) {
      //console.log("message", message.readUInt8(0), message.readUInt32BE(1), message.readUInt16BE(5), message.readUInt16BE(7));
      var packet_type = message.readUInt8(0);
      if (packet_type === PACKET_TYPE_I_AM_AP) {
        var tcp_port = message.readUInt16LE(2);
        console.log(rinfo);
        console.log("found tcp port", tcp_port);
        this.tcp = new TCPSocket(rinfo.address, tcp_port);
        this.tcp.onopen = this.tcpOpened;
        this.tcp.ondata = this.tcpReceivedData.bind(this);
        this.tcp.onerror = this.tcpError;
        this.tcp.onclose = this.tcpClosed;
        console.log("constructed tcp socket");
      }
    }.bind(this));
    this.udp.on("error", console.log);
    console.log("set all callbacks");
  }

  stop() {
    this.udp.close();
    this.udp = null;
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
    console.log("TCP Error", error)
  }

  tcpClosed() {
    console.log("TCP connection closed.");
  }
}

module.exports = Network;
