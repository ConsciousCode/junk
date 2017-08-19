import wave
import numpy as np
import random
import os

def read_iter(f, size):
	fp = wave.open(f, 'r')
	
	while True:
		data = fp.readframes(size)
		
		if len(data) != size:
			yield np.pad(data, size)
			break
		else:
			yield data

def read(f, size=None):
	fp = wave.open(f, 'r')
	
	if size:
		data = fp.readframes(size)
		return np.pad(data, size)
	
	bits = 8*fp.getsampwidth()
	
	return np.fromstring(
		fp.readframes(fp.getnframes()),
		dtype='uint' + str(bits)
	)/float(bits)

def listaudio(d):
	d = os.path.expanduser(d)
	ls = os.listdir(d)
	random.shuffle(ls)
	for f in ls:
		print f
		f = os.path.join(d, f)
		
		for v in read(f):
			yield np.expand_dims(v, 1)
