class Linear:

  def __init__(self, domain, range):
    self.domain = domain
    self.range = range

  def get(self, value):
    d = self.domain[1] - self.domain[0] 
    r = self.range[1] - self.range[0] 

    return (((value - self.domain[0] ) * r) / d) + self.range[0]

'''
USAGE EXAMPLE

import math
import scale

x = scale.Linear([0, 454.22], [1037.726, 7962.337])
print x.get(194.5899 - (math.cos(math.pi/4) * 4.5))
'''