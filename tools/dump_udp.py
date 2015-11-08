import socket
import struct

PORT = 59734
MULTICAST_ADDRESS = "239.249.134.147"
BUFFER_SIZE = 2**8

# Create the socket
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# Set some options to make it multicast-friendly
#s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
#try:
#  s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEPORT, 1)
#except AttributeError:
#  pass # Some systems don't support SO_REUSEPORT
#s.setsockopt(socket.SOL_IP, socket.IP_MULTICAST_TTL, 20)
#s.setsockopt(socket.SOL_IP, socket.IP_MULTICAST_LOOP, 1)

# Bind to the port
s.bind(('', PORT))

# Set some more multicast options
intf = socket.gethostbyname(socket.gethostname())
#s.setsockopt(socket.SOL_IP, socket.IP_MULTICAST_IF, socket.inet_aton(intf))
s.setsockopt(socket.SOL_IP, socket.IP_ADD_MEMBERSHIP, socket.inet_aton(MULTICAST_ADDRESS) + socket.inet_aton(intf))

# Receive the data, then unregister multicast receive membership, then close the port
while True:
  try:
    data, sender_addr = s.recvfrom(BUFFER_SIZE)
  except:
    break
  print(struct.unpack(">BIHH", data), sender_addr)

# disconnect from the group
s.setsockopt(socket.SOL_IP, socket.IP_DROP_MEMBERSHIP, socket.inet_aton(MULTICAST_ADDRESS) + socket.inet_aton('0.0.0.0'))
s.close()
