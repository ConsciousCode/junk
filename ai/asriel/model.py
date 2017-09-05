import tensorflow as tf
from tensorflow.models.rnn.rnn_cell import BasicLSTMCell, LSTMCell, MultiRNNCell
import numpy as np

def perceptron(x, weights, biases):
	#Hidden layer with ELU activation
		layer_1 = tf.nn.elu(tf.add(tf.matmul(x, weights[0]), biases[0]))
		#Hidden layer with ELU activation
		layer_2 = tf.nn.elu(tf.add(tf.matmul(layer_1, weights[1]), biases[1]))
		return tf.matmul(layer_2, weights[2]) + biases[2]

class Simplifier:
	def __init__(self, i, o):
		with tf.variable_scope("Simplifier"):
			self.encoder = LSTMCell(i, o, True)
			self.decoder = LSTMCell(o, i, True)
			self.last = tf.Variable(tf.zeros([i]), name="last")
			self.encode_state = tf.Variable(tf.zeros([o]), name="encode state")
			self.decode_state = tf.Variable(tf.zeros([o]), name="decode state")
	
	def __call__(self, inp):
		encoding, encode_state = self.encoder(inp, self.encode_state)
		decoding, decode_state = self.decoder(encoding, self.decode_state)
		
		loss = seq2seq.sequence_loss_by_example(
			[inp],
			[decoding],
			[tf.ones(inp.shape())]
		)
		
		opt = tf.train.AdamOptimizer()
		return tf.tuple([
			encoding,
			opt.minimize(loss),
			self.encode_state.assign(encode_state),
			self.decode_state.assign(decode_state)
		])[0]

class Pavlov:
	def __init__(self, foresight):
		'''
		foresight - how many time steps to take into account
		'''
		self.foresight = foresight
	
	def __call__(self, inp, happiness, id, superego):
		'''
		inp - the inputs to use
		happiness - the happiness manager, must be of type Happiness
		id - the network which generates intent vectors
		superego - a list of networks which predict the next value of the
			network before it in the list
		'''
		
		
		
		def cond(last, cur, ids, ses):
			return last < cur
		
		def body(last, cur, ids, ses):
			intent, ids = self.id(tf.concat(0, [inp, value]), ids)
			ineval, ses = self.superego(intent, ses)
			
			r = tf.range(1, self.accuracy + 1)
			
			
			return [cur, tf.pow(self.accuracy, r)*ineval/r, ids, ses]
		
		neginf, first = body(None, tf.constant(-float('inf')), None, None)
		last, cur, ids, ses = tf.control_flow_ops.While(cond, body, [
			neginf, first, self.id_state, self.superego_state
		])
		
		predict_loss = seq2seq.sequence_loss_by_example(
			[tf.slice(self.delta, [0, 0], [1, -1])],
			[tf.slice(happiness.delta, [0, 0], [1, -1])],
			[tf.ones(self.delta.shape())]
		)
		
		intent_loss = seq2seq.sequence_loss_by_example(
			[first],
			[last],
			[tf.ones(last.shape())]
		)
		
		opt = tf.train.AdamOptimizer()
		return tf.tuple(
			last,
			opt.minimize(
				tf.reduce_sum(predict_loss)/self.last_prediction.get_shape()[0]
			),
			opt.minimize(
				tf.reduce_sum(intent_loss)/first.get_shape()[0]
			),
			tf.assign(self.last_delta, last)
		)[0]

class Memory:
	def __init__(self, keydim, valdim, capacity, forget):
		with tf.variable_scope("Memory"):
			self.A = tf.Variable(tf.float32, [keydim, capacity], name="address")
			self.C = tf.Variable(tf.float32, [capacity, valdim], name="content")
		
		self.keydim = keydim
		self.valdim = valdim
		self.capacity = capacity
		self.forget = forget
	
	def get(self, key):
		addr = tf.matmul(self.A, key)
		return tf.matmul(tf.transpose(self.C), addr)
	
	def set(self, key, val):
		addr = tf.matmul(self.A, key)
		
		return tf.tuple([
			tf.matmul(tf.transpose(self.C), addr),
			self.A.assign_add(
				0.01*(tf.tile(tf.pack([key]), self.capacity) - self.A)
			),
			self.C.assign_add(tf.matmul(addr, val))
		])[0]

class Mind:
	def __init__(self, echo):
		with tf.variable_scope("Mind"):
			self.echo = tf.Variable(tf.zero([echo]), name="echo")
	
	def __call__(self, cores, mediator):
		echo = self.echo
		for i in xrange(len(cores))
			echo = mediator(tf.concat(0, [echo, cores[i]]))
			

class Happiness:
	def __init__(self, terms):
		with tf.variable_scope("Happiness"):
			self.delta = tf.Variable(tf.zeros([terms]), name="delta")
			self.last = tf.Variable(0, name="last")
	
	def add(self, value):
		return tf.tuple([
			self.delta.assign(
				tf.concat(0, [self.delta[1:], self.last]) - self.delta
			),
			self.last.assign(value)
		])
