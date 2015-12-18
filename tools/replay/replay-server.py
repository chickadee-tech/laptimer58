import json
import socket
import struct
import sys
import time

print("loading replay data")
packets = []
with open(sys.argv[1], "r") as f:
  all_logs = json.load(f)
  for log in all_logs:
    deviceId = log["chip_id"]
    for frame_group in log["frame_groups"]:
      timestamp = frame_group["received"]
      packet = []

      packet.append(struct.pack(">I", deviceId))
      for frame in frame_group["frames"]:
        packet.append(struct.pack(">BIHH", frame["iteration"],
                                             frame["timestamp"],
                                             int(frame["frequency"]),
                                             frame["strength"]))
      packets.append((timestamp, "".join(packet)))

print("loaded " + str(len(packets)) + " packets")

tcp_server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

tcp_server.bind(("127.0.0.1", 7000))
tcp_server.listen(1)
print("waiting for connection")
connection, address = tcp_server.accept()
print("connected")
time.sleep(5)
print("replaying")
last_timestamp = None
for timestamp, packet in packets:
  if last_timestamp:
    time.sleep((timestamp - last_timestamp))
  last_timestamp = timestamp
  connection.sendall(packet)
  print("sent " + str(timestamp) + " packet")

connection.close()
