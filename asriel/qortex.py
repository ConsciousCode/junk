import math
import numpy as np
import tensorflow as tf

def mse(actual, ideal):
	return tf.reduce_mean(tf.square(ideal - actual))

def squash(x):
	return x/(1 + abs(x))

def psquash(x):
	return x/(1 + 2*abs(x)) + 0.5

'''
def xavier(shape, dtype):
	return tf.random_normal(shape, 0, 0.1, dtype=dtype)
	return tf.random_normal(shape, 0, len(shape)/sum(shape), dtype=dtype)
'''

class Output:
	def __init__(self, value, size):
		self.value = value
		self.size = size

class Unit:
	def clear(self, jar):
		pass
	
	def build(self, inp, insize):
		raise NotImplementedError()
	
	def __getitem__(self, name):
		if name == self.name:
			return self

class Objective(Unit):
	def train(self, inp):
		raise NotImplementedError()
	
	def test(self, inp):
		raise NotImplementedError()

class Jar:
	def __init__(self):
		self.sess = tf.Session()
		self.saver = tf.train.Saver()
		
		self.sess.run(tf.initialize_all_variables())
	
	def save(self, fn):
		self.saver.save(self.sess, fn)
	
	def load(self, fn):
		self.saver.restore(self.sess, fn)

class Cell(Unit):
	def __init__(self, layers, name=""):
		self.layers = layers
		self.name = name
	
	def clear(self, jar):
		for layer in self.layers:
			layer.clear(jar)
	
	def __getitem__(self, name):
		if name == self.name:
			return name
		for layer in self.layers:
			v = layer[name]
			if v:
				return v
	
	def build(self, inp, insize):
		n = 0
		with tf.variable_scope("Cell"):
			for layer in self.layers:
				with tf.variable_scope("layer_{}".format(n)):
					out = layer.build(inp, insize)
					inp = out.value
					insize = out.size
				n += 1
		return out

class Noise(Unit):
	def __init__(self, name=""):
		self.name = name
		
		with tf.variable_scope("Noise"):
			with tf.variable_scope(name):
				self.active = tf.Variable(np.asarray(True), name="active")
	
	def set_active(self, v, jar):
		jar.sess.run(self.active.assign(np.asarray(v)))
	
	def build(self, inp, insize):
		return Output(
			tf.cond(self.active,
				lambda: (
					inp*15 + tf.random_normal((insize, 1), 0, 1)
				)/16,
				lambda: inp
			),
			insize
		)

class Transform(Unit):
	actives = {
		"linear": lambda x: x,
		"squash": squash,
		"psquash": psquash
	}
	
	def __init__(self, out, activation="squash", name=""):
		self.outsize = out
		self.activation = activation
		self.name = name
	
	def build(self, inp, insize):
		with tf.variable_scope("Transform"):
			with tf.variable_scope(self.name):
				W = tf.get_variable("W",
					[self.outsize, insize]#,
					#initializer=xavier
				)
				b = tf.get_variable("b",
					[self.outsize, 1]#,
					#initializer=xavier
				)
				
				return Output(
					Transform.actives[self.activation](tf.matmul(W, inp) + b),
					self.outsize
				)

class Sequencer(Unit):
	def __init__(self, osize, name=""):
		self.outsize = osize
		self.name = name
	
	def clear(self, jar):
		with tf.variable_scope("Sequencer"):
			with tf.variable_scope(self.name):
				v = tf.get_variable("Sequencer/" + self.name + "/state")
				jar.sess.run(v.assign(np.zeros(v.shape)))
	
	def build(self, inp, insize):
		with tf.variable_scope("Sequencer"):
			with tf.variable_scope(self.name):
				Wz = tf.get_variable("Wz",
					[self.outsize, insize + self.outsize]#,
					#initializer=xavier
				)
				bz = tf.get_variable("bz",
					[self.outsize, 1]#,
					#initializer=xavier
				)
				
				Wr = tf.get_variable("Wr",
					[self.outsize, insize + self.outsize]#,
					#initializer=xavier
				)
				br = tf.get_variable("br",
					[self.outsize, 1]#,
					#initializer=xavier
				)
				
				Wh = tf.get_variable("Wh",
					[self.outsize, insize + self.outsize]#,
					#initializer=xavier
				)
				bh = tf.get_variable("bh",
					[self.outsize, 1]#,
					#initializer=xavier
				)
				
				state = tf.get_variable(
					"state", [self.outsize, 1],
					initializer=tf.zeros,
					trainable=False
				)
				
				hx = tf.concat(0, [state, inp])
				
				z = psquash(tf.matmul(Wz, hx) + bz)
				r = psquash(tf.matmul(Wr, hx) + br)
				
				rhx = tf.concat(0, [r*state, inp])
				
				h = squash(tf.matmul(Wh, rhx) + bh)
				
				return Output(
					state.assign((1 - z)*state + z*h), self.outsize
				)

class Supervised(Objective):
	def __init__(self, insize, batch, net):
		self.buf = tf.Variable(tf.zeros([insize, batch]), False)
		self.pos = tf.placeholder(tf.int32)
		inp = tf.slice(
			self.buf, tf.pack([tf.constant(0), self.pos]), [insize, 1]
		)
		
		self.target = tf.placeholder(tf.float32)
		
		opt = tf.train.AdadeltaOptimizer()
		
		self.net = net
		self.runop = net.build(inp, insize).value
		self.lossop = mse(self.runop, self.target)
		self.trainop = opt.minimize(self.lossop)
	
	def train(self, inp, target, jar):
		jar.sess.run(self.buf.assign(inp))
		
		err = 0
		
		for x in xrange(inp.shape[1]):
			loss, _ = jar.sess.run([self.lossop, self.trainop], feed_dict={
				self.pos: x,
				self.target: target
			})
			
			print "loss", loss
			
			err = err*0.95 + loss*0.05
		
		return err

class Run(Objective):
	def __init__(self, insize, unit):
		self.inp = tf.placeholder(tf.float32)
		self.unit = unit.build(self.inp, insize).value
	
	def run(self, inp, jar):
		return jar.sess.run(self.unit, feed_dict={self.inp: inp})

class Predict(Objective):
	def __init__(self, insize, batch, up, down):
		self.last = np.zeros([insize, 1])
		
		self.up = up
		self.down = down
		
		self.batch = batch
		self.buf = tf.Variable(tf.zeros([insize, batch + 1]), False)
		self.pos = tf.placeholder(tf.int32)
		
		cur = tf.slice(
			self.buf, tf.pack([0, self.pos]), [insize, 1]
		)
		next = tf.slice(
			self.buf, tf.pack([0, self.pos + 1]), [insize, 1]
		)
		
		upop = up.build(cur, insize)
		downop = down.build(upop.value, upop.size)
		
		self.upop = upop.value
		self.downop = downop.value
		
		self.loss = mse(self.downop, next)
		self.trainop = tf.train.AdadeltaOptimizer().minimize(self.loss)
	
	def __getitem__(self, name):
		return self.up[name] or self.down[name]
	
	def train(self, inp, jar):
		jar.sess.run(self.buf.assign(np.concatenate([
			self.last, inp,
			np.zeros([inp.shape[0], self.batch - inp.shape[1]])
		], 1)))
		
		err = 0
		for x in xrange(inp.shape[1]):
			loss, _ = jar.sess.run([self.loss, self.trainop], {
				self.pos: x
			})
			
			err = err*0.95 + loss*0.05
		
		self.last = np.expand_dims(inp[:,-1], 1)
		
		return err
	
	def predict(self, inp, jar):
		jar.sess.run(self.buf.assign(np.concatenate([self.last, inp], 1)))
		
		out = np.zeros(inp.shape)
		
		err = 0
		for x in xrange(inp.shape[1]):
			out[:,x] = jar.sess.run(self.downop, {
				self.pos: x
			})
		
		self.last = np.expand_dims(inp[:,-1], 1)
		
		return out
