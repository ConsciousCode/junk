import tensorflow as tf
import numpy as np

def weight(i, o, name="W"):
	return tf.Variable(
		tf.truncated_normal([i, o], stddev=0.1), name=name
	)

def bias(n, name="b"):
	# Slight positive bias
	return tf.Variable(tf.constant(0.1, shape=[n]), name=name)

softmax = tf.nn.softmax
sigmoid = softmax
tanh = tf.tanh
relu = tf.nn.relu
elu = tf.nn.elu
softplus = tf.nn.softplus

def recmax(x):
	return x/(1 + abs(x))

def positive_recmax(x):
	return x/(1 + 2*abs(x)) + 0.5

class Model(object):
	'''
	Base class for models, mostly DRY for train
	'''
	def __call__(self, *args, **kwargs):
		raise NotImplementedError()
	
	def train(self, inp, out):
		opt = tf.train.AdadeltaOptimizer()
		return opt.minimize(self.loss(inp, out))
	
	def loss(self, inp, out):
		return tf.reduce_mean(tf.squared_difference(out, self(inp)))

class Basic(Model):
	'''
	Basic feedforward NN
	'''
	def __init__(self, i, o, act):
		super(Basic, self).__init__()
		
		self.W = weight(i, o)
		self.b = bias(o)
		self.act = act
	
	def __call__(self, x, activation=tanh):
		return self.act(tf.matmul(x, self.W) + self.b)

class MixMod(object):
	'''
	A highly condensed version of the popular LSTM
	'''
	def __init__(self, i, o, s):
		super(MixMod, self).__init__()
		
		self.X = Basic(i + s, s, tanh)
		self.M = Basic(i + s, s, sigmoid)
		self.Y = Basic(i + s, o, tanh)
		self.state = tf.Variable(tf.zeros([1, s]))
	
	def __call__(self, x):
		inp = tf.concat([x, self.state], axis=1)
		
		mix = self.X(inp)
		mod = self.M(inp)
		
		hupdate = tf.assign(
			self.state, self.state*mod + mix*(1 - mod)
		)
		
		with tf.control_dependencies([hupdate]):
			return self.Y(inp)

class MetaModel(Model):
	'''
	A pattern of model composition which yields unique behavior
	'''
	def __init__(self):
		super(MetaModel, self).__init__()

class Autoencoder(MetaModel):
	'''
	Attempts to find a dense representation of the input
	'''
	def __init__(self, encode, decode):
		self.encode = encode
		self.decode = decode
	
	def __call__(self, inp):
		enc = self.encode(inp)
		recon = self.decode(enc)
		
		return recon
	
	def loss(self, inp, _=None):
		# We want the decoder to output the unchanged input
		return super(Autoencoder, self).loss(inp, inp)
	
	def train(self, inp, _=None):
		return super(Autoencoder, self).train(inp, inp)

class Hedon(MetaModel):
	'''
	Attempts to minimize a given cost vector
	'''
	def __init__(self, id, ego):
		super(Hedon, self).__init__()
		
		self.id = id
		self.ego = ego
	
	def __call__(self, inp):
		# During "normal" operation, only the id operates
		return self.id(inp)
	
	def loss(self, inp, cost):
		decision = self(inp)
		prediction = self.ego(tf.join([inp, decision]))
		
		# The prediction drives the id's learning
		# Note that this is equivalent to setting the target output
		#  to 0 (no cost) and performing MSE
		id_loss = tf.reduce_mean(prediction**2)
		
		# The ego learns to predict the cost accurately
		ego_loss = tf.reduce_mean(tf.squared_difference(
			prediction, Delay(1)(cost)
		))
		
		return tf.tuple([id_loss, ego_loss])

class Batch(object):
	def __init__(self, size, dtype='float'):
		self.size = size
		self.queue = tf.FIFOQueue(size, dtype)
		self.qr = None
	
	def __call__(self, inp):
		enq_op = self.enqueue(inp)
		
		if not self.qr:
			self.qr = tf.train.QueueRunner(self.queue, [enq_op])
		
		return self.queue.dequeue_many(self.size)

class Delay(object):
	'''
	Delay the input by a given amount, outputting 0 otherwise
	'''
	def __init__(self, by=1, dtype='float'):
		self.by = by
		self.queue = tf.FIFOQueue(by, dtype)
	
	def __call__(self, inp):
		# Enqueue, then only dequeue when enough samples are in
		enq = self.queue.enqueue(inp)
		with tf.control_dependencies([enq]):
			return tf.cond(self.queue.size() < self.by,
				lambda: tf.constant(0.0),
				lambda: self.queue.dequeue()
			)

class Split(object):
	'''
	Split the input into a number of tensors of given sizes
	'''
	def __init__(self, sizes):
		self.sizes = sizes
	
	def __call__(self, inp):
		return tf.split(inp, self.sizes)

class Join(object):
	'''
	Join the input tensors into a single output
	'''
	def __init__(self, tensors):
		self.tensors = tensors
	
	def __call__(self, inp):
		return tf.concat(self.tensors)

class Layers(Model):
	def __init__(self, layers):
		self.layers = layers
	
	def __call__(self, inp):
		for layer in self.layers:
			inp = layer(inp)
		
		return inp
	
	def __getitem__(self, x):
		return self.layers[x]

class Input(object):
	def __init__(self, name, feed, shape=None, dtype='float'):
		self.name = name
		self.feed = feed
		self.placeholder = tf.placeholder(dtype, shape=shape, name=name)
	
	def __call__(self):
		return self.placeholder
	
	def next(self):
		return next(self.feed)

class Trainer(object):
	def __init__(self, student, out):
		self.student = student
		self.out = out
	
	def __call__(self, inp):
		return self.train(inp, self.out)
	
	def train(self, inp, out):
		return self.student.train(inp, out)
	
	def loss(self, inp, out):
		return self.student.loss(inp, out)

class Do(object):
	'''
	Abstract Tensorflow boilerplate into a pretty interface
	'''
	def __init__(self, inputs, net, fname):
		inputs = inputs if type(inputs) is list else [inputs]
		print inputs
		self.inputs = inputs
		self.net = net([v() for v in inputs])
		self.saver = tf.train.Saver()
		self.fname = fname
		self.sess = None
		self.itstep = 0
	
	def __enter__(self):
		self.sess = tf.Session().__enter__()
		
		self.sess.run(tf.global_variables_initializer())
		
		return self
	
	def __exit__(self, type, value, traceback):
		self.sess.__exit__(type, value, traceback)
	
	def run(self, ops, feed={}):
		return self.sess.run(ops, feed_dict=feed)
	
	def step(self):
		try:
			feed = {v.placeholder:v.next() for v in self.inputs}
			self.run(self.net, feed)
			
			self.itstep += 1
			
			return True
		except StopIteration:
			return False
	
	def report(self, freq=1):
		return self.itstep%freq == 0
	
	def save(self):
		self.saver.save(self.sess, self.fname)
