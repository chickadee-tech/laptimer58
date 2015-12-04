class FrameGroup:
  def __init__(self, chip_id):
    self.chip_id = chip_id
    self.frames = []

  def add_frame(self, frame):
    self.frames.append(frame)

class Frame:
  def __init__(self, iteration, timestamp, frequency, strength):
    self.iteration = iteration
    self.timestamp = timestamp
    self.frequency = frequency
    self.strength = strength

  def to_dict(self):
    d = {}
    d["iteration"] = self.iteration
    d["timestamp"] = self.timestamp
    d["frequency"] = self.frequency
    d["strength"] = self.strength
    return d
