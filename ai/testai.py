import numpy as np

'''
def activate(x):
	return x*(x > -1) - (x <= -1)

def deractivate(x):
	return x > -1
#'''

'''
def activate(x):
	return 1/(1 + np.exp(-x))

def deractivate(x):
	return x*(1 - x)
#'''

'''
def activate(x):
	return (np.exp(x) - 1)*(x < 0) + x*(x > 0)

def deractivate(x):
	return (x + 1)*(x < 0) + (x >= 0)
#'''

'''
def activate(x):
	return 12*np.tanh(2*x/3)/7

def deractivate(x):
	return (144 - 49*x*x)/125
#'''

'''
def activate(x):
	return np.tanh(x)

def deractivate(x):
	return (1 - x*x)
#'''

#'''
def activate(x):
	return x

def deractivate(x):
	return 1
#'''

LR = 0.1

RHO = 0.95
EPS = 1e-6

class Learnable:
	def __init__(self, x, y, m):
		self.value = np.random.normal(0, 0.25, (x, y))
		
		self.mem = m
		self.echo = np.zeros((x, y))
		self.grad_sq = np.zeros((x, y))
		self.delta_sq = np.zeros((x, y))
	
	def __str__(self):
		return "vegd:\n + {}\n + {}\n + {}\n + {}".format(
			self.value, self.echo, self.grad_sq, self.delta_sq
		)
	
	def reset(self):
		self.echo[:] = 0
		self.grad_sq[:] = 0
		self.delta_sq[:] = 0

	def learn(self, err, echo):
		grad = self.echo*err
		grad_sq = RHO*self.grad_sq + (1 - RHO)*grad**2
		
		delta = np.sqrt(self.delta_sq + EPS)/np.sqrt(grad_sq + EPS)*grad
		delta_sq = RHO*self.delta_sq + (1 - RHO)*delta**2
		
		self.grad_sq = grad_sq
		self.delta_sq = delta_sq
		
		self.value += delta
		
		#Echoes should only occur though recurrencies, and they propagate
		# proportionally to the node's echo
		self.echo[:self.mem] *= echo
		self.echo[self.mem:] = 0

class SubNode:
	def __init__(self, i, o, m):
		self.value = Learnable(o + m, i + m, m)
		self.bias = Learnable(o + m, 1, m)
	
	def __str__(self):
		return "{}\n + {}".format(self.value, self.bias)
	
	def reset(self):
		self.value.reset()
		self.bias.reset()
	
	def process(self, x):
		return activate(np.matmul(self.value.value, x) + self.bias.value)
	
	def echo(self, og, inp):
		self.value.echo += np.matmul(og, inp.T)
		self.bias.echo += og
	
	def learn(self, err, echo):
		self.value.learn(err, echo)
		self.bias.learn(err, echo)

class Node:
	def __init__(self, inp, out, mem):
		self.inp = inp
		self.out = out
		self.mem = mem
		
		self.mix = SubNode(inp, out, mem)
		self.mod = SubNode(inp, out, mem)
		
		self.state = np.zeros((mem, 1))
	
	def reset(self):
		self.mix.reset()
		self.mod.reset()
		
		self.state[:] = 0
	
	def forward(self, x):
		inp = np.concatenate([self.state, x])
		#inp = np.concatenate([np.zeros((self.mem, 1)), x])
		
		mix = self.mix.process(inp)
		mod = self.mod.process(inp)
		
		#The output-side of the gradient calculation without the error
		dx = mod*deractivate(mix)
		dm = mix*deractivate(mod)
		
		#Multiplicative term used to backprop to this time step
		self.echo = (
			np.matmul(self.mix.value.value.T, mod)
			+ np.matmul(self.mod.value.value.T, mix)
		)
		
		self.mix.echo(dx, inp)
		self.mod.echo(dm, inp)
		
		#Combine the mix and mod
		res = mix*mod
		
		#Separate the state and output
		self.state = res[:self.mem]
		
		return res[self.mem:]
	
	def learn(self, x, ye):
		#Reminder: dW = -alpha*(x.f'(y))
		
		tye = np.concatenate([-self.state, ye])
		
		#Multiplication gate switches sources
		
		err = self.echo*tye
		#print err
		echo = err[:self.mem]
		
		self.mix.learn(tye, echo)
		self.mod.learn(tye, echo)
		
		return err[self.mem:]

#Training

import wave

def getfile(s):
	f = wave.open(s, 'r')
	
	for 
