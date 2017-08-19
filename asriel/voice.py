import qortex as Q
import numpy as np
import wave
import os
import random

frame = 1
feats = 256
batch = 4096

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
		yield np.resize(data[b:b + size*mbatch], (size, bs))

model = Q.Predict(
	frame, batch,
	Q.Sequencer(feats),
	Q.Cell([
		#Q.Noise("noise"),
		Q.Sequencer(feats),
		Q.Transform(frame)
	])
)

f = wave.open("test.wav", "wb")
f.setnchannels(1)
f.setsampwidth(1)
f.setframerate(8000)

jar = Q.Jar()

for f in read_files():
	for data in batchify(f, frame, batch):
		print model.train(data, jar)
		jar.save("voice.Q")
	model.clear(jar)
