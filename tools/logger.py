# Logs received data to files. It produces one file for each device.
import multiprocessing

import datetime
import os
import os.path

import time

import json

class Logger(multiprocessing.Process):
  def __init__(self, queue):
    multiprocessing.Process.__init__(self)
    self.data_by_device = {}
    self.queue = queue
    now = datetime.datetime.now()

    self.start_time = str(now.hour) + str(now.minute)

    self.directory = os.path.join("logs", str(now.year), str(now.month), str(now.day))
    if not os.path.isdir(self.directory):
      os.makedirs(self.directory)

  def run(self):
    while True:
      try:
        frame_group = self.queue.get(True)
      except:
        break
      self.update(frame_group)

    fn = os.path.join(self.directory, self.start_time + ".json")
    all_data = []
    with open(fn, "w") as f:
      json.dump(self.data_by_device.values(), f, indent=2, separators=(',', ': '))
    print("wrote log to " + fn)

  def update(self, frame_group):
    if frame_group.chip_id not in self.data_by_device:
      self.data_by_device[frame_group.chip_id] = {"chip_id": frame_group.chip_id,
                                                  "frame_groups": []}
    frames = []
    group = {"received": time.time(), "frames": frames}
    for frame in frame_group.frames:
      frames.append(frame.to_dict())

    self.data_by_device[frame_group.chip_id]["frame_groups"].append(group)
