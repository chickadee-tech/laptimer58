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
var Speech = require('react-native-speech');
var Network = require('./network');
var KernelFilter = require('./kernel-filter');
var PeakFinder = require('./peak-finder');
var ReplayNetwork = require('./replay-network');

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
    return { frequency: "-", strength: 0 };
  },
  componentDidMount: function() {
    //this.network = new Network();
    this.network = new ReplayNetwork();
    this.network.addListener("newData", function(deviceId, data) {
      console.log(deviceId, data);
      let frequency = this.state.frequency;
      if (frequency === "-") {
        frequency = Object.keys(data)[0];
      }
      this.setState({"frequency": frequency, "strength": data[frequency].strengths[data[frequency].strengths.length - 1]});
    }.bind(this));
    var kernel_filter = new KernelFilter();
    this.network.addListener("newData", kernel_filter.processData);
    this.network.addListener("connectionLost", function() {
      Speech.speak({
        text: "Connection lost",
        voice: 'en-US',
        rate: 0.5,
      });
    })
    var peak_finder = new PeakFinder();
    kernel_filter.addListener("newData", peak_finder.processData);
    this.lastPeakTimestamp = {};
    this.lap = -1;
    peak_finder.addListener("newPeak", function(frequency, timestamp, strength) {
      if (!(frequency in this.lastPeakTimestamp)) {
        Speech.speak({
          text: "Timer ready on frequency " + frequency,
          voice: 'en-US',
          rate: 0.5,
        });
      } else {
        let lapTime = (timestamp - this.lastPeakTimestamp[frequency]) / 1000;
        this.lap++;
        if (this.lap === 0) {
          Speech.speak({
            text: "Timer running",
            voice: 'en-US',
            rate: 0.5,
          });
        } else if (this.lap > 0) {
          Speech.speak({
            text: "Lap " + this.lap + ". " + lapTime + " seconds",
            voice: 'en-US',
            rate: 0.5,
          });
        }
      }
      this.lastPeakTimestamp[frequency] = timestamp;
    }.bind(this));
    this.network.start();
  },
  componentWillUnmount: function() {
    this.network.stop();
  },
  render: function() {
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
