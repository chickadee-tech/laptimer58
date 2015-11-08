import multiprocessing
import argparse
import time
import socket
import struct

class DummyChickadee(multiprocessing.Process):
  def __init__(self, filename, shift):
    multiprocessing.Process.__init__(self)
    self.file = open(filename, "r")
    header = self.file.readline().strip()
    name, version = header.split()
    extra_headers = 0
    if version == "0.0.2":
      extra_headers = 1
    elif version == "0.0.3":
      extra_headers = 3
    for x in xrange(extra_headers):
      print(self.file.readline().strip())

    self.shift = shift

  def run(self):
    # First we wait to coordinate ourselves with the other dummies.
    time.sleep(self.shift / 1000)

    # Now run what would normally be in the Arduino setup code.
    # We don't need to worry about mimicking the Wifi.

    # Join the UDP multicast group.
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind(('', 59734))
    mreq = struct.pack("=4sl", socket.inet_aton("239.249.134.147"), socket.INADDR_ANY)
    sock.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, mreq)
    sock.setsockopt(socket.IPPROTO_IP, socket.IP_MULTICAST_TTL, 2)
    sock.sendto("robot", ("239.249.134.147", 59734))

    # Next, fake the Arduino loop using the times in the log.
    last_timestamp = None
    last_clock = None
    packet = self.file.read(9)
    while len(packet) == 9:
      i, timestamp, frequency, strength = struct.unpack(">BIHH", packet)
      #print(i, timestamp, frequency, strength)

      if last_timestamp and last_clock:
        sleep_ms = (timestamp - last_timestamp) - (time.clock() * 1000 - last_clock)
        time.sleep(sleep_ms / 1000)
      last_timestamp = timestamp
      last_clock = time.clock() * 1000
      packet = self.file.read(9)

parser = argparse.ArgumentParser()
parser.add_argument("ckd_one")
parser.add_argument("ckd_two")
args = parser.parse_args()

for fn in [args.ckd_one, args.ckd_two]:
  if ":" in fn:
    fn, shift = fn.split(":")
    shift = int(shift)
  else:
    shift = 0
  d = DummyChickadee(fn, shift)
  d.start()
