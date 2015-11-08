/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
} = React;
var dgram = require('react-native-udp');
var Speech = require('react-native-speech');
global.Buffer = global.Buffer || require('buffer').Buffer;

// ImmersionRC frequencies (not RaceBand): 5740, 5760, 5780, 5800, 5820, 5840, 5860
// RaceBand 5685, 5695, 5732, 5769, 5806, 5843, 5880, 5917 MHz
// Boscam
// FR1     5865, 5845, 5825, 5805, 5785, 5765, 5745, 5725
// A Band: 5865, 5845, 5825, 5805, 5785, 5765, 5745, 5725
// FR2     5733, 5752, 5771, 5790, 5809, 5828, 5847, 5866
// B Band: 5733, 5752, 5771, 5790, 5809, 5828, 5847, 5866
// FR3     5707, 5685, 5665, 5645, 5885, 5905, 5925, 5945
// E Band: 5705, 5685, 5665, 5645, 5885, 5905, 5925, 5945
// FR4 5740,5760,5780,5800,5820,5840,5860,5880
var Chickadee = React.createClass({
  getInitialState: function() {
    return { frequency: "-", strength: "-" };
  },
  componentDidMount: function() {
    this.socket = dgram.createSocket("udp4");
    this.socket.bind(59734);
    this.socket.once("listening", function() {
      this.socket.addMembership("239.249.134.147");
      this.setState({frequency: 5800, strength: 2});
    }.bind(this));
    this.socket.on("message", function(message, rinfo) {
      //console.log("message", message.readUInt8(0), message.readUInt32BE(1), message.readUInt16BE(5), message.readUInt16BE(7));
      this.setState({strength: message.readUInt16BE(7)});
    }.bind(this));
    this.socket.on("error", console.log);
  },
  componentWillUnmount: function() {
    this.socket.close();
    this.socket = null;
  },
  render: function() {
    Speech.speak({
      text: '3.5 volts',
      voice: 'en-US'
    });
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          {this.state.frequency}
        </Text>
        <Text style={styles.instructions}>
          {this.state.strength}
        </Text>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('Chickadee', () => Chickadee);
