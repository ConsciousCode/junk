import wave
import numpy as np
import qortex as Q

batch = 4096

model = Q.Run(batch, Q.Noise("noise"))

jar = Q.Jar()

fo = wave.open("test.wav", "wb")
fo.setnchannels(1)
fo.setsampwidth(1)
fo.setframerate(8000)

out = model.run(np.zeros((batch, 1)), jar)

fo.writeframes(((out + 1)*127).astype(np.uint8).tostring())

fo.close()
