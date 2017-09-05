import tensorflow as tf
import numpy as np
from mixmod import MixMod

def generate_sequence(n):
    def generate_palindrome(n):
        d = np.random.uniform(-1, 1, n/2)
        p = [d]
        
        if n%2 == 1:
            p.append(np.random.uniform(-1, 1, 1))
        
        p.append(d[::-1])
        return np.concatenate(p)

    def generate_other(n):
        return np.random.uniform(-1, 1, n)
    
    if np.random.choice([True, False]):
        return True, generate_palindrome(n)
    else:
        return False, generate_other(n)

model = MixMod(1, 1, 8)
inp = tf.placeholder(tf.float32, shape=(None, 1, 1))
output, state = tf.nn.dynamic_rnn(
    model, inp, #tf.shape(inp),
    dtype=tf.float32,
    #initial_state=tf.zeros((1, 8))
)
opt = tf.train.AdadeltaOptimizer()

real = tf.placeholder(tf.float32, shape=(1,1))

with tf.Session() as sess:
    sess.run(tf.global_variables_initializer())
    for epoch in range(10000):
        pal, seq = generate_sequence(np.random.randint(3, 16))
        
        cl = model(seq)
        
        loss = tf.squared_difference(float(pal), cl)
        
        err = sess.run(opt.minimize(loss), feed_dict={
            inp: seq, real: np.array([[float(pal)]])
        })
        if epoch%100 == 0:
            print "Epoch", epoch/100, ":", err
