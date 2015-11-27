import select
import socket
import struct
import time

MULTICAST_PORT = 59734
TCP_PORT = 59735
MULTICAST_ADDRESS = "239.249.134.147"
BUFFER_SIZE = 2**8

NEW_CLIENT_PERIOD = 60

# Create the socket
udp_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# Set some options to make it multicast-friendly
#s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
#try:
#  s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEPORT, 1)
#except AttributeError:
#  pass # Some systems don't support SO_REUSEPORT
#s.setsockopt(socket.SOL_IP, socket.IP_MULTICAST_TTL, 20)
#s.setsockopt(socket.SOL_IP, socket.IP_MULTICAST_LOOP, 1)

# Bind to the port
udp_socket.bind(('', MULTICAST_PORT))

# Set some more multicast options
intf = socket.gethostbyname(socket.gethostname())
#s.setsockopt(socket.SOL_IP, socket.IP_MULTICAST_IF, socket.inet_aton(intf))
udp_socket.setsockopt(socket.SOL_IP,
                      socket.IP_ADD_MEMBERSHIP,
                      socket.inet_aton(MULTICAST_ADDRESS) + socket.inet_aton(intf))
udp_socket.setsockopt(socket.IPPROTO_IP, socket.IP_MULTICAST_TTL, 20)

tcp_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
tcp_socket.bind(('', TCP_PORT))
tcp_socket.listen(2)
print("Listening for connections")

last_new_client = None
last_timestamp = None
quit = False
chickadees = []
while not quit:
  if not last_new_client or time.clock() - last_new_client > NEW_CLIENT_PERIOD:
    udp_socket.sendto(struct.pack("bH", 1, TCP_PORT), (MULTICAST_ADDRESS, MULTICAST_PORT))
    last_new_client = time.clock()
  readable, writable, errored = select.select([tcp_socket] + chickadees, [], [], NEW_CLIENT_PERIOD)
  for chickadee in readable:
    if chickadee is tcp_socket:
      chickadee, address = tcp_socket.accept()
      print("new tcp", address)
      chickadees.append(chickadee)
      continue
    try:
      data = chickadee.recv(BUFFER_SIZE)
    except:
      quit = True
    iteration, timestamp, frequency, strength = struct.unpack(">BIHH", data)
    if last_timestamp:
      pass
      #print(timestamp - last_timestamp, chickadee.getpeername())
    last_timestamp = timestamp

for chickadee in chickadees:
  chickadee.close()

# disconnect from the group
s.setsockopt(socket.SOL_IP, socket.IP_DROP_MEMBERSHIP, socket.inet_aton(MULTICAST_ADDRESS) + socket.inet_aton('0.0.0.0'))
s.close()
