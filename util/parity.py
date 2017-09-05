import numpy as np

W = 24
H = 24

def get(s, x, y):
	if x < 0 or y < 0 or x >= W or y >= H:
		return False
	return s[x, y]

def evolve(s):
	sn = np.copy(s)
	for x in xrange(W):
		for y in xrange(H):
			c = (
				get(space, x - 1, y - 1) +
				get(space, x,     y - 1) +
				get(space, x + 1, y - 1) +
				get(space, x + 1, y) +
				
				get(space, x + 1, y + 1) +
				get(space, x,     y + 1) +
				get(space, x - 1, y + 1) +
				get(space, x - 1, y)
			) - 4
			
			#>4 0s
			if c < 0:
				sn[x, y] = False
			#>4 1s
			elif c > 0:
				print c
				sn[x, y] = True
			#equal 0s and 1s 
	return sn

def print_grid(g):
	for x in xrange(W):
		for y in xrange(H):
			if g[x, y]:
				print "\x1b[7;40;37m \x1b[0m",
			else:
				print "\x1b[1;40;37m \x1b[0m",
		print

space = np.random.randint(0, 2, (W, H), dtype=bool)

for x in xrange(2):
	print_grid(space)
	print
	space = evolve(space)
