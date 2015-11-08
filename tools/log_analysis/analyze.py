#!/usr/bin/python
from __future__ import print_function

import argparse


import math
import struct
import sys
import datetime

import matplotlib.pyplot as plt

import numpy
import scipy.signal

# From https://gist.github.com/endolith/250860
def peakdet(v, delta, x = None):
    """
    Converted from MATLAB script at http://billauer.co.il/peakdet.html

    Returns two arrays

    function [maxtab, mintab]=peakdet(v, delta, x)
    %PEAKDET Detect peaks in a vector
    %        [MAXTAB, MINTAB] = PEAKDET(V, DELTA) finds the local
    %        maxima and minima ("peaks") in the vector V.
    %        MAXTAB and MINTAB consists of two columns. Column 1
    %        contains indices in V, and column 2 the found values.
    %
    %        With [MAXTAB, MINTAB] = PEAKDET(V, DELTA, X) the indices
    %        in MAXTAB and MINTAB are replaced with the corresponding
    %        X-values.
    %
    %        A point is considered a maximum peak if it has the maximal
    %        value, and was preceded (to the left) by a value lower by
    %        DELTA.

    % Eli Billauer, 3.4.05 (Explicitly not copyrighted).
    % This function is released to the public domain; Any use is allowed.

    """
    maxtab = []
    mintab = []

    if x is None:
        x = numpy.arange(len(v))

    v = numpy.asarray(v)

    if len(v) != len(x):
        sys.exit('Input vectors v and x must have same length')

    if not numpy.isscalar(delta):
        sys.exit('Input argument delta must be a scalar')

    if delta <= 0:
        sys.exit('Input argument delta must be positive')

    mn, mx = numpy.Inf, -numpy.Inf
    mnpos, mxpos = numpy.NaN, numpy.NaN

    lookformax = True

    for i in numpy.arange(len(v)):
        this = v[i]
        if this > mx:
            mx = this
            mxpos = x[i]
        if this < mn:
            mn = this
            mnpos = x[i]

        if lookformax:
            if this < mx-delta:
                maxtab.append((mxpos, mx))
                mn = this
                mnpos = x[i]
                lookformax = False
        else:
            if this > mn+delta:
                mintab.append((mnpos, mn))
                mx = this
                mxpos = x[i]
                lookformax = True

    return numpy.array(maxtab), numpy.array(mintab)


parser = argparse.ArgumentParser()
parser.add_argument("--times")
parser.add_argument("ckd_one")
parser.add_argument("ckd_two")
args = parser.parse_args()

total_samples = 0
start_time = None
end_time = None
split_data = []
for fn in [args.ckd_one, args.ckd_two]:
  if ":" in fn:
    fn, shift = fn.split(":")
    shift = int(shift)
  else:
    shift = 0
  if "x" in fn:
    fn, scale = fn.split("x")
    scale = float(scale)
  else:
    scale = 1.0
  this_data = {}
  split_data.append(this_data)
  with open(fn, "r") as f:
    header = f.readline().strip()
    name, version = header.split()
    extra_headers = 0
    if version == "0.0.2":
      extra_headers = 1
    elif version == "0.0.3":
      extra_headers = 3
    for x in xrange(extra_headers):
      print(f.readline().strip())
    packet = f.read(9)
    while len(packet) == 9:
      i, timestamp, frequency, strength = struct.unpack(">BIHH", packet)
      if frequency != 5800:
        packet = f.read(9)
        continue

      if frequency not in this_data:
        this_data[frequency] = [[], []]
      this_data[frequency][0].append(shift + timestamp)
      this_data[frequency][1].append(strength * scale)
      if not start_time:
        start_time = timestamp
      end_time = timestamp
      total_samples += 1
      packet = f.read(9)
smoothed = []
for frequency_data in split_data:
  for frequency in frequency_data:
    frequency_data[frequency][0] = numpy.array(frequency_data[frequency][0], dtype=numpy.uint32)
    strengths = numpy.array(frequency_data[frequency][1], dtype=numpy.uint16)
    #smoothed = scipy.signal.savgol_filter(strengths, 21, 3)
    smoothed = scipy.signal.savgol_filter(strengths, 21, 2)
    frequency_data[frequency][1] = smoothed
    plt.plot(frequency_data[frequency][0], smoothed)
    #smoothed = strengths

# for frequency_data in split_data:
#   for frequency in frequency_data:
#     old_data = frequency_data[frequency][1]
#     sqrt = numpy.array(old_data, dtype=numpy.float32)
#     frequency_data[frequency][1] = sqrt
#     for i in xrange(len(frequency_data[frequency][1])):
#       sqrt[i] = math.sqrt(old_data[i])

summed_data = {}
for frequency in split_data[0]:
  t1, s1 = split_data[0][frequency]
  t2, s2 = split_data[1][frequency]
  i1 = 0
  i2 = 0
  times = []
  strengths = []
  summed_data[frequency] = (times, strengths)
  while i1 < len(t1) and i2 < len(t2):
    if t1[i1] < t2[i2]:
      if i2 > 0:
        times.append(t1[i1])
        strengths.append(s1[i1] + s2[i2 - 1])
      i1 += 1
    elif t1[i1] > t2[i2]:
      if i1 > 0:
        times.append(t2[i2])
        strengths.append(s1[i1 - 1] + s2[i2])
      i2 += 1
    else:
      times.append(t2[i2])
      strengths.append(s1[i1] + s2[i2])
      i1 += 1
      i2 += 1

for frequency in summed_data:
  times, strengths = summed_data[frequency]
  peaks, valleys = peakdet(strengths, 80, times)
  plt.plot(times, strengths)
  if len(peaks) > 0:
    plt.scatter(peaks[:,0], peaks[:,1], color='blue')
    plt.scatter(valleys[:,0], valleys[:,1], color='red')

golden_times = []
if args.times:
  with open(args.times, "r") as f:
    for line in f.readlines():
      minutes, seconds = line.strip().split(":")
      golden_times.append(datetime.timedelta(minutes=int(minutes),
                                             seconds=float(seconds)))

first = None
previous = None
print()
print("lap time")
print("computed       real           delta")
for peak, golden in zip(peaks[1:], golden_times):
  peak = datetime.timedelta(milliseconds=int(peak[0]))
  if not first:
    first = (peak, golden)
    #print(peak, golden)
  else:
    peak_diff = peak - previous[0]
    golden_diff = golden - previous[1]
    diff_diff = golden_diff - peak_diff
    dd = str(abs(diff_diff))
    if diff_diff.days < 0:
      dd = "-" + dd
    print(peak_diff, golden_diff, dd)
  previous = (peak, golden)
plt.show()
