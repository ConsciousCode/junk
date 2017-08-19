import wave
import random
import os
import struct

import numpy as np
import qortex as Q

frame = 1
feats = 256
batch = 4096

def read_files(audio):
	for fn in audio:
		f = wave.open(fn, 'r')
		frames = f.readframes(f.getnframes())
		
		yield np.fromstring(frames, dtype=np.uint8).astype(np.float32)/2**15

def batchify(data, size, mbatch):
	total = data.size
	if total%size:
		data = np.append(data,
			np.zeros(size - total%size, dtype=np.float32)
		)
	
	for b in xrange(0, total, size*mbatch):
		bs = min((total - b)/size, mbatch)
		yield np.resize(data[b:b + size*mbatch], (size, bs))

print "Loading model..."

model = Q.Predict(
	frame, batch,
	Q.Sequencer(feats),
	Q.Cell([
		#Q.Noise("noise"),
		Q.Sequencer(feats),
		Q.Transform(frame)
	])
)
jar = Q.Jar()
jar.load("voice.Q")
#model['noise'].set_active(False, jar)
model.clear(jar)

fo = wave.open("test.wav", "wb")
fo.setnchannels(1)
fo.setsampwidth(1)
fo.setframerate(8000)

for fd in read_files(["audio/Warning - Goat Marriage_232266421_soundcloud.wav"]):
	print "Processing..."
	for data in batchify(fd, frame, 4096):
		out = model.predict(data, jar)
		
		fo.writeframes(((out + 1)*127).astype(np.uint8).tostring())

fo.close()
