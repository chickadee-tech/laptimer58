import matplotlib.pyplot as plt

class Grapher:
  def __init__(self, queue):
    self.data_by_frequency = {}
    self.queue = queue
    #plt.ion()
    plt.draw()

  def run(self):
    while True:
      try:
        frame_group = self.queue.get(True)
      except:
        break
      self.update(frame_group)

  def update(self, frame_group):
    for frame in frame_group.frames:
      if frame.frequency not in self.data_by_frequency:
        self.data_by_frequency[frame.frequency] = {}
      frequency_data = self.data_by_frequency[frame.frequency]
      if frame_group.chip_id not in frequency_data:
        self.data_by_frequency[frame.frequency][frame_group.chip_id] = [[], []]
      data_stream = self.data_by_frequency[frame.frequency][frame_group.chip_id]
      data_stream[0].append(frame.timestamp)
      data_stream[1].append(frame.strength)

    for frequency in self.data_by_frequency:
      for device in self.data_by_frequency[frequency]:
        data = self.data_by_frequency[frequency][device]
        plt.plot(data[0], data[1])
        #print("plot", frequency, device, len(data[0]))

    plt.draw()
