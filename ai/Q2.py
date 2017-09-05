Node:
 * process(i, h) -> output

State:
 * ?

Bus:
 * push(value)
 * pop() -> value
 
 def weight(i, o, name="W"):
 	return tf.Variable(
 		tf.truncated_normal([i, o], stddev=0.1), name=name
 	)

 def bias(n, name="b"):
 	# Slight positive bias
 	return tf.Variable(tf.constant(0.1, shape=[n]), name=name)
	
class Bus:
	def __init__(self, size=1):
		self.queue = tf.FIFOQueue(size)
	
	def push(self, v):
		return self.queue.enqueue(v)
	
	def pop(self):
		return self.queue.dequeue()

class State:
	def __init__(self):
		pass

class Node:
	def process(i, h):
		pass

class Basic:
	def __init__(self, i, o, act=tf.tanh):
		self.W = tf.Variable(tf.zeros((i, o)))
		self.b = tf.Variable(tf.zeros((i,)))
		self.act = act
	
	def process(self, inp):
		return self.act(tf.matmul(inp, self.W) + self.b)
	
	def learn(self, inp, ideal, opt):
        return opt.minimize(tf.reduce_mean(
            tf.squared_difference(ideal, self.process(inp))
        ))

class MixMod:
	def __init__(self, i, o, h=0):
		self.state = tf.Variable(tf.zeros(h))
		
		self.mix = Basic(i + h, h, tf.nn.sigmoid)
        self.mod = Basic(i + h, h, tf.tanh)
        self.out = Basic(i + h, o, tf.nn.elu)
    
    def process(self, inp):
        hx = tf.concatenate([inp, self.state])
        mix = self.mix(hx)
        return (
            self.out.process(hx),
            self.state*(1 - mix) + self.mod.process(hx)*mix
        )
    
    def learn(self, inp, ideal, opt):
        
