
import multiprocessing

from logger import Logger
from grapher import Grapher
from network import Network

grapher_queue = multiprocessing.Queue()
queues = [grapher_queue]
analyzers = [Logger]
for i, analyzer in enumerate(analyzers):
  q = multiprocessing.Queue()
  queues.append(q)
  analyzer = analyzer(q) # Constructs the object.
  analyzer.start()
  analyzers[i] = analyzer

network = Network(queues)
network.start()

grapher = Grapher(grapher_queue)
grapher.run()
