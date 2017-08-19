import qortex as Q
import numpy as np
import wave
import math
import struct

f = wave.open("test.wav", "wb")
f.setnchannels(1)
f.setsampwidth(1)
f.setframerate(8000)

def tone(x):
	return math.sin(2*math.pi*220*x/8000.0)

sec = np.array(
	[tone(x) for x in xrange(int(8000/(2*math.pi)))]
).reshape((1, int(8000/(2*math.pi)))).astype(np.float32)

sine = Q.Predict(
	1, sec.shape[1],
	Q.Sequencer(4),
	Q.Cell([Q.Sequencer(4), Q.Transform(1)])
)

jar = Q.Jar()

err = 1
while err > 0.1:
	err = sine.train(sec, jar)
	print err

for x in xrange(2):
	out = sine.predict(sec, jar)
	f.writeframes(((out + 1)*127).astype("uint8").tobytes())
