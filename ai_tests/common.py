import numpy as np
import tensorflow as tf

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
	
	def train(self, inp, out, opt=None):
		opt = opt or tf.train.AdadeltaOptimizer()
		return opt.minimize(self.loss(inp, out))
	
	def loss(self, inp, out):
		return tf.reduce_mean(tf.squared_difference(out, self(inp)))

class Basic(Model):
	'''
	Basic feedforward NN
	'''
	def __init__(self, i, o, act):
		super(Basic, self).__init__()
		
		with tf.variable_scope("Basic"):
			self.W = weight(i, o)
			self.b = bias(o)
			self.act = act
	
	def __call__(self, x, activation=tanh):
		with tf.variable_scope("Basic"):
			return self.act(tf.matmul(x, self.W) + self.b)
