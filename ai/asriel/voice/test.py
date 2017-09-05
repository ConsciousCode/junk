import wave
import random
import os
import struct

import numpy as np
import qortex as Q

def read_files(audio):
	for fn in audio:
		f = wave.open(fn, 'r')
		frames = f.readframes(f.getnframes())
		
		yield np.fromstring(frames, dtype=np.int16).astype(np.float32)/2**15

def batchify(data, size, mbatch):
	total = data.size
	if total%size:
		data = np.append(data,
			np.zeros(size - total%size, dtype=np.float32)
		)
	
	for b in xrange(0, total, size*mbatch):
		bs = min((total - b)/size, mbatch)
		yield np.resize(data[b:b + size*mbatch], (bs, size))

print "Loading model..."

model = Q.Model.load("asriel.voice")
model["noise"].active = False
frame = model["frame"].outputs

features = model["features"].outputs
model.reset()

print model

fo = wave.open("test.wav", "wb")
fo.setnchannels(1)
fo.setsampwidth(1)
fo.setframerate(44100)

for fd in read_files(["audio/Warning - Goat Marriage_232266421_soundcloud.wav"]):
	print "Processing..."
	for batch in batchify(fd, frame, 4096):
		batch = model.runbatch(batch).ravel()
		
		fo.writeframes(((batch + 1)*128).astype(np.uint8).tostring())

fo.close()
