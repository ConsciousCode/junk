class Metric:
	def __init__(self, name, nicks, mul=1, base=None, exp=1):
		if base is None:
			base = self
		
		self.name = name
		self.nicks = nicks
		self.mul = mul
		self.base = base
		self.exp = exp
	
	def rename(self, name, nicks):
		self.name = name
		self.nicks = nicks
		return self
	
	def __pow__(self, x):
		return Metric(
			None, None, self.mul**x, self.base, self.exp*x
		)
	
	def __mul__(self, x):
		return Metric(
			self.name, self.nicks, self.mul*x, self.base, self.exp
		)

registry = {}

def register(metric):
	registry[metric.name] = metric
	for n in metric.nicks:
		registry[n] = metric
	return metric

def convert(a, b):
	return registry[a].mul/registry[b].mul

meter = register(Metric("meter", 'm'))
meter3 = meter**3

tsp = register((meter3*4.92892e-6).rename('teaspoon', ['t', 'tsp']))
tbsp = register(
	(tsp*3).rename('tablespoon', ['T', 'tbsp', 'tbl', 'tbs'])
)
floz = register((tsp*6).rename('fluid ounce', ['floz']))
cup = register((tbsp*16).rename('cup', ['c']))
pint = register((cup*2).rename('pint', ['p', 'pt', 'flpt']))
quart = register((pint*2).rename('quart', ['q', 'qt', 'flqt']))
gallon = register((quart*4).rename('gallon', ['g', 'gal']))
