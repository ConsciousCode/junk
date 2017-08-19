import wave
import random
import os
import struct

import theano
import theano.tensor as T
import numpy as np
import qortex as Q

frame = 2
features = 256

def read_files():
	audio = []
	for r, d, sf in os.walk("audio"):
		for f in sf:
			audio.append(os.path.join(r, f))
	#Go over every sample twice
	audio *= 2
	random.shuffle(audio)
	
	for fn in audio:
		print "Processing file", fn
		f = wave.open(fn, 'r')
		frames = f.readframes(f.getnframes())
		
		yield (
			np.fromstring(frames, dtype=np.uint8).astype(np.float32)/128 + 1
		)/2

def batchify(data, size, mbatch):
	total = data.size
	if total%size:
		data = np.append(data,
			np.zeros(size - total%size, dtype=np.float32)
		)
	
	for b in xrange(0, total, size*mbatch):
		bs = min((total - b)/size, mbatch)
		yield np.resize(data[b:b + size*mbatch], (bs, size))

print "Building model..."

data = Q.Data(frame, "frame")
model = Q.Model(Q.layer([
	data,
	Q.Sequencer(features),
	Q.Probe(name="features"),
	Q.Noise(name="noise"),
	Q.Sequencer(frame)
]))

print "Building trainer..."

ndata = T.fvector('ndata')
model.trainto(ndata, [ndata])
print "Begin training"
model.save("asriel.voice")

step = 0
for fd in read_files():
	model.reset()
	
	for batch in batchify(fd, frame, 10000):
		it = iter(batch)
		c = it.next()
		for n in it:
			model.train(c, n)
			c = n
			
			if step%1000 == 0:
				print "Saving..."
				model.save("asriel.voice")
			
			step += 1
