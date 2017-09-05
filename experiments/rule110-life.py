import numpy as np

def convolve(x):
	return [
		0, #000
		1, #001
		1, #010
		1, #011
		0, #100
		1, #101
		1, #110
		0, #111
	][(x[0]<<2)|(x[1]<<1)|x[0]]

def rule110(x):
	out = np.zeros(len(x), dtype=bool)
	for i in range(1, len(x) - 1):
		out[i] = convolve(x[i-1:i+1])
	
	out[0] = convolve([0, x[0], x[1]])
	out[-1] = convolve([x[-2], x[-1], 0])
	
	return out

def mutate(x, mr):
	return x^(np.random.rand(len(x)) < mr)

epoch = None
best_epoch = np.random.rand(1000) >= 0.5
best_epoch_age = -1

beta = 0.01
gamma = 0.4

def genesis():
    global epoch
    epoch = mutate(best_epoch, gamma)
    return epoch

def isempty(x):
    return sum(x) == 0

soup = genesis()

def pprint(x):
	print ''.join(str('1' if v else '0') for v in x)

def king_me():
    global age, best_epoch_age, epoch, best_epoch
    if age > best_epoch_age:
        print
        print "Best", age
        pprint(epoch)
        best_epoch_age = age
        best_epoch = epoch

try:
    age = 0
    while True:
        soup = mutate(rule110(soup), beta)
        if isempty(soup):
            king_me()
            soup = genesis()
            age = 0
        else:
            age += 1
except KeyboardInterrupt:
    king_me()
    print
    print "Longest epoch:", best_epoch_age
    pprint(best_epoch)
    
    input()
    
    soup = best_epoch
    while not isempty(soup):
        pprint(soup)
        soup = rule110(soup)
