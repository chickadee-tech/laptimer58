import multiprocessing
import select
import socket
import struct
import time

from data import *

MULTICAST_PORT = 59734
TCP_PORT = 59735
MULTICAST_ADDRESS = "239.249.134.147"
BUFFER_SIZE = 2**12

NEW_CLIENT_PERIOD = 60

PACKET_TYPE_I_AM_AP = 3

class Network(multiprocessing.Process):
  def __init__(self, output_queues):
    multiprocessing.Process.__init__(self)
    self.output_queues = output_queues

  def run(self):
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


    print("Listening for connections")

    bad_gaps = {}
    last_new_client = None
    last_timestamp = {}
    first_timestamp = {}
    quit = False
    chickadees = []
    while not quit:
      if not last_new_client or time.clock() - last_new_client > NEW_CLIENT_PERIOD:
        udp_socket.sendto(struct.pack("b", 1), (MULTICAST_ADDRESS, MULTICAST_PORT))
        last_new_client = time.clock()
      try:
        readable, writable, errored = select.select([udp_socket] + chickadees, [], [], NEW_CLIENT_PERIOD)
      except KeyboardInterrupt:
        quit = True
        continue
      for chickadee in readable:
        if chickadee is udp_socket:
          try:
            data, addr = chickadee.recvfrom(BUFFER_SIZE)
          except:
            quit = True
            break
          print(len(data), addr)
          packet_type = struct.unpack(">b", data[0])[0]
          print(packet_type)

          # If its an I_AM_AP then tcp to it.
          if packet_type == PACKET_TYPE_I_AM_AP:
            tcp_port = struct.unpack("bbH", data)[2]
            ap = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            print((addr[0], tcp_port))
            ap.connect((addr[0], tcp_port))
            print("init connection")
            chickadees.append(ap)
          continue
        try:
          data = chickadee.recv(BUFFER_SIZE)
        except:
          quit = True
          break
        chip_id = struct.unpack(">I", data[:4])[0]
        if chip_id not in bad_gaps:
          bad_gaps[chip_id] = []
          last_timestamp[chip_id] = None
          first_timestamp[chip_id] = None
        print(chip_id, (len(data) - 4) / 9)
        frame_group = FrameGroup(chip_id)
        for i in range((len(data) - 4) / 9):
          iteration, timestamp, frequency, strength = struct.unpack(">BIHH", data[i * 9 + 4 : (i+1) * 9 + 4])
          frame_group.add_frame(Frame(iteration, timestamp, frequency, strength))
          if i == 0:
           print(iteration, timestamp, frequency, strength)
          if last_timestamp[chip_id]:
            if timestamp - last_timestamp[chip_id] > 30 + 4:
              bad_gaps[chip_id].append(timestamp - last_timestamp[chip_id])
          last_timestamp[chip_id] = timestamp
          if not first_timestamp[chip_id]:
            first_timestamp[chip_id] = timestamp

        for q in self.output_queues:
          q.put(frame_group)

        print(sum(bad_gaps[chip_id]) * 100. / (timestamp - first_timestamp[chip_id]))

    for chickadee in chickadees:
      chickadee.close()

    # disconnect from the group
    udp_socket.setsockopt(socket.SOL_IP, socket.IP_DROP_MEMBERSHIP, socket.inet_aton(MULTICAST_ADDRESS) + socket.inet_aton('0.0.0.0'))
    udp_socket.close()

    tcp_socket.close()
