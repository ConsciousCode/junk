import qortex as Q
import numpy as np

xor = Q.Supervised(2, 4, Q.Cell([
	Q.Transform(4),
	Q.Transform(1, "linear")
]))

print dir(xor.runop)
exit()

jar = Q.Jar()

ex = np.array([[0, 0, 1, 1], [0, 1, 0, 1]])
ts = np.array([0, 1, 1, 0])

epoch = 0
while True:
	print xor.train(ex, ts, jar)
	epoch += 1
