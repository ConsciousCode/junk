import tensorflow as tf
import numpy as np

from common import *
RNNCell = tf.contrib.rnn.RNNCell

class MixMod(RNNCell):
	'''
	A highly condensed version of the popular LSTM
	
	State and input are concatenated and fed to 3 gates,
	 Mix (X), Mod (M), and Out (Y).
	 * X produces the new state to mix with the old state
	 * M determines how much of the new and old state are retained
	 * Y gives an output with arbitrary dimensions, unlike traditional models
	    which require the output be the same as the hidden state.
	'''
	def __init__(self, i, o, s):
		super(MixMod, self).__init__()
		
		self.ni = i
		self.no = o
		self.nh = s
		
		with tf.variable_scope("MixMod"):
			self.X = Basic(i + s, s, tanh)
			self.M = Basic(i + s, s, sigmoid)
			self.Y = Basic(i + s, o, tanh)
	
	@RNNCell.output_size.getter
	def output_size(self):
		return self.no
	
	@RNNCell.state_size.getter
	def state_size(self):
		return self.nh
	
	def __call__(self, inputs, state):
		with tf.variable_scope("MixMod"):
			xh = tf.concat([inputs, state], axis=1)
			
			mix = self.X(xh)
			mod = self.M(xh)
			
			return (
				self.Y(xh),
				tf.multiply(state, mod) + tf.multiply(mix, 1 - mod)
			)
