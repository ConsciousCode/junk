import theano as the
import theano.tensor as T
import numpy as np

RHO = 0.95
EPS = 1e-6

class Data:
	def __init__(self, value, updates=None):
		if updates is None:
			updates = []
		
		self.value = value
		self.updates = updates
	
	def __add__(self, v):
		return Data(self.value + v.value, self.updates + v.updates)
	
	def function(self, params):
		return the.function(params, self.value, updates=self.updates)

class Learnable:
	def __init__(self, r, c):
		self.value = value = the.shared(np.zeros([r, c]))
		
		self.echo = echo = the.shared(np.zeros([r, c]))
		
		self.g_sq = g_sq = the.shared(np.zeros([r, c]))
		self.d_sq = d_sq = the.shared(np.zeros([r, c]))
	
	def reset(self):
		return Data([], [
			(self.echo, self.echo*0),
			(self.g_sq, self.g_sq*0),
			(self.d_sq, self.d_sq*0)
		])
	
	def learn(self, err, echo):
		grad = self.echo*err
		g_sq = RHO*self.g_sq + (1 - RHO)*grad**2
		
		delta = grad*T.sqrt(self.d_sq + EPS)/T.sqrt(g_sq + EPS)
		delta_sq = RHO*self.d_sq + (1 - RHO)*delta**2
		
		return Data([], [
			(self.echo, self.echo*echo),
			(self.g_sq, g_sq),
			(self.d_sq, d_sq),
			(self.value, self.value + delta)
		])

class SubNode:
	def __init__(self, i, o, m):
		self.value = Learnable(o + m, i + m)
		self.bias = Learnable(o + m, 1)
	
	def reset(self):
		return self.value.reset() + self.bias.reset()
	
	def process(self, x):
		return Data([T.dot(self.value.value, x) + self.bias.value], [])
	
	def echo(self, og, inp):
		return Data([], [
			(self.value.echo, self.value.echo + T.dot(og, inp.T)),
			(self.bias.echo, self.bias.echo + og)
		])

class Node:
	def __init__(self, i, o, m):
		self.m = m
		
		self.mix = SubNode(i, o, m)
		self.mod = SubNode(i, o, m)
		
		self.state = the.shared(np.zeros((m,)))
		self.echo = the.shared(np.zeros((i + m,)))
	
	def reset(self):
		return self.mix.reset() + self.mod.reset() + Data([], [
			(self.state, self.state*0)
		])
	
	def forward(self, x):
		inp = T.concatenate([self.state, x])
		
		dmix = self.mix.process(inp)
		dmod = self.mod.process(inp)
		
		mix = dmix.value[0]
		mod = dmod.value[0]
		
		#Multiplicative term used to backprop to this time step
		echo = (
			T.dot(self.mix.value.value.T, mod)
			+ T.dot(self.mod.value.value.T, mix)
		)
		
		xecho = self.mix.echo(mod, inp)
		mecho = self.mod.echo(mix, inp)
		
		res = mix*mod
		print self.state.type, res[(0,0):(self.m,1)]
		
		return dmix + dmod + xecho + mecho + Data(res[self.m:], [
			(self.state, res[(0,0):(self.m,1)]),
			(self.echo, echo)
		])
	
	def backward(self, ye):
		return (
			T.dot(self.mix.value.value[self.m:].T, ye) +
			T.dot(self.mod.value.value[self.m:].T, ye)
		)
	
	def learn(self, x, ye):
		#Reminder: dW = -alpha*(x.f'(y))
		
		tye = T.concatenate([-self.state, ye])
		
		#Multiplication gate switches sources
		
		err = self.echo*tye
		echo = err[:self.m]
		
		dmix = self.mix.learn(tye, echo)
		dmod = self.mod.learn(tye, echo)
		
		return dmix + dmod

class Brain:
	def __init__(self, i, o, m):
		self.node = node = Node(i, o, m)
		
		self.reset = node.reset().function([])
		
		x = T.vector('x')
		f = node.forward(x)
		self.forward = node.forward(x).function([x])
		
		x = T.vector('x')
		ye = T.vector('ye')
		self.learn = node.learn(x, ye).function([x, ye])

brain = Brain(3, 4, 5)
