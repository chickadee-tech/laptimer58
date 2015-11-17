#include <ESP8266WiFi.h>
#include <WiFiUDP.h>
#include <EEPROM.h>

// Wifi related globals.
const char* SSID = "chickadee";
const char* PASSWORD = "iflyfast";

const IPAddress MULTICAST_ADDRESS(239, 249, 134, 147);
const uint16_t PORT = 59734;

// Radio related globals.
const unsigned int TUNE_TIME_MS = 300; // 30

// Cross-power up globals.
const uint32_t EEPROM_VERSION = 1;

#define RSSI_READS 10

const int BOARD_LED = 0;
const int ESP_LED = 2;
const int SPEAKER = 14;
const int ADC_SELECT = 12;

const int RCV_CHIP_SELECT = 4;
const int RCV_CLK = 5;
const int RCV_DATA = 13;

unsigned long lastReadTime;
unsigned long lastTuneTime;

WiFiUDP udp;

void setup() {
  Serial.begin(115200);
  delay(10);

  uint32_t chipId = ESP.getChipId();
  Serial.println(chipId);

  // Get our file counter.
  EEPROM.begin(12);
  uint32_t storedChipId;
  EEPROM.get(0, storedChipId);
  Serial.println(storedChipId);
  uint32_t fileCount = 0;
  // Initialize the eeprom completely.
  if (storedChipId != chipId) {
    EEPROM.put(0, chipId);
    EEPROM.put(4, EEPROM_VERSION);
    EEPROM.put(8, fileCount);
  } else {
    EEPROM.get(8, fileCount);
    Serial.println(fileCount);
  }
  EEPROM.put(8, fileCount + 1);
  EEPROM.end();

  // put your setup code here, to run once:
  pinMode(0, OUTPUT);
  WiFi.mode(WIFI_AP_STA);
  WiFi.softAP(SSID, PASSWORD);
  udp.beginMulticast(WiFi.softAPIP(), MULTICAST_ADDRESS, PORT);

  // ADC_SELECT switches between measuring RSSI and battery voltage. v3 boards
  // don't have the battery voltage divider hooked up so we just set it to the
  // RSSI for good.
  pinMode(ADC_SELECT, OUTPUT);
  digitalWrite(ADC_SELECT, HIGH);

  pinMode(BOARD_LED, OUTPUT);

  pinMode(RCV_DATA, OUTPUT);
  pinMode(RCV_CLK, OUTPUT);
  pinMode(RCV_CHIP_SELECT, OUTPUT);
}

// One iteration byte to detect missed packets.
// Four bytes for the time.
// Two bytes for the frequency.
// Two bytes for the strength.
char packet[] = {0, 0, 0, 0, 0, 0, 0, 0, 0};

uint8_t packetNo = 0;
uint16_t frequencies[] = {5800, 5740, 0, 0, 0, 0, 0};
uint16_t f_register[] = {0x2984, 0x2906, 0, 0, 0, 0, 0};
uint16_t lastValue = 0;
bool increasing = true;
uint16_t tuningFrequency = 0;
uint16_t tunedFrequency = 0;

void loop() {
  digitalWrite(BOARD_LED, LOW);
  int i = 0;
  while (frequencies[i] != 0) {
    if (tunedFrequency != 0) {
      udp.beginPacketMulticast(MULTICAST_ADDRESS, PORT, WiFi.softAPIP());
      packet[0] = packetNo++;
      packet[1] = (char) (lastReadTime >> 24);
      packet[2] = (char) (lastReadTime >> 16);
      packet[3] = (char) (lastReadTime >> 8);
      packet[4] = (char) lastReadTime;
      packet[5] = (char) (tunedFrequency >> 8);
      packet[6] = (char) tunedFrequency;
      packet[7] = (char) (lastValue >> 8);
      packet[8] = lastValue;
      udp.write(packet, sizeof(packet));
      udp.endPacket();

      Serial.print(lastReadTime);
      Serial.print(" ");
      Serial.print(tunedFrequency);
      Serial.print(" ");
      Serial.println(lastValue);
    }
    if (tuningFrequency != 0) {
      if (tuningFrequency != tunedFrequency) {
        // Wait the remainder of the tune time if we actually had to tune.
        int delay_time = TUNE_TIME_MS - (millis() - lastTuneTime);
        Serial.println(delay_time);
        if (delay_time > 0) {
          delay(delay_time);
        }
      }
      tunedFrequency = tuningFrequency;

      // Read value.
      lastValue = 0;
      for (uint8_t i = 0; i < RSSI_READS; i++) {
        lastValue += analogRead(A0);
      }
      lastValue = lastValue / RSSI_READS;
      //Serial.print(tunedFrequency);
      //Serial.print(" ");
      //Serial.println(lastValue);
      lastReadTime = millis();
    }
    // Tune radio.
    tuningFrequency = frequencies[i];
    if (tuningFrequency != tunedFrequency) {
      RCV_FREQ(f_register[i]);
    }
    
    lastTuneTime = millis();
    i++;
    digitalWrite(BOARD_LED, HIGH);
  }
}

/*
 * SPI driver based on fs_skyrf_58g-main.c Written by Simon Chambers
 * TVOUT by Myles Metzel
 * Scanner by Johan Hermen
 * Inital 2 Button version by Peter (pete1990)
 * Refactored and GUI reworked by Marko Hoepken
 * Universal version my Marko Hoepken
 * Diversity Receiver Mode and GUI improvements by Shea Ivey
 * OLED Version by Shea Ivey
 * Seperating display concerns by Shea Ivey
 * 
The MIT License (MIT)
Copyright (c) 2015 Marko Hoepken
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
void RCV_FREQ(uint16_t channelData) {
  uint8_t j;
  // Second is the channel data from the lookup table
  // 20 bytes of register data are sent, but the MSB 4 bits are zeros
  // register address = 0x1, write, data0-15=channelData data15-19=0x0
  SERIAL_ENABLE_HIGH();
  SERIAL_ENABLE_LOW();

  // Register 0x1
  SERIAL_SENDBIT1();
  SERIAL_SENDBIT0();
  SERIAL_SENDBIT0();
  SERIAL_SENDBIT0();

  // Write to register
  SERIAL_SENDBIT1();

  // D0-D15
  //   note: loop runs backwards as more efficent on AVR
  for (j = 16; j > 0; j--)
  {
    // Is bit high or low?
    if (channelData & 0x1)
    {
      SERIAL_SENDBIT1();
    }
    else
    {
      SERIAL_SENDBIT0();
    }

    // Shift bits along to check the next one
    channelData >>= 1;
  }

  // Remaining D16-D19
  for (j = 4; j > 0; j--)
    SERIAL_SENDBIT0();

  // Finished clocking data in
  SERIAL_ENABLE_HIGH();
  delayMicroseconds(1);
  //delay(2);

  digitalWrite(RCV_CHIP_SELECT, LOW);
  digitalWrite(RCV_CLK, LOW);
  digitalWrite(RCV_DATA, LOW);
}

void SERIAL_SENDBIT1()
{
  digitalWrite(RCV_CLK, LOW);
  delayMicroseconds(1);

  digitalWrite(RCV_DATA, HIGH);
  delayMicroseconds(1);
  digitalWrite(RCV_CLK, HIGH);
  delayMicroseconds(1);

  digitalWrite(RCV_CLK, LOW);
  delayMicroseconds(1);
}

void SERIAL_SENDBIT0()
{
  digitalWrite(RCV_CLK, LOW);
  delayMicroseconds(1);

  digitalWrite(RCV_DATA, LOW);
  delayMicroseconds(1);
  digitalWrite(RCV_CLK, HIGH);
  delayMicroseconds(1);

  digitalWrite(RCV_CLK, LOW);
  delayMicroseconds(1);
}

void SERIAL_ENABLE_LOW()
{
  delayMicroseconds(1);
  digitalWrite(RCV_CHIP_SELECT, LOW);
  delayMicroseconds(1);
}

void SERIAL_ENABLE_HIGH()
{
  delayMicroseconds(1);
  digitalWrite(RCV_CHIP_SELECT, HIGH);
  delayMicroseconds(1);
}

