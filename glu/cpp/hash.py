import sys
import struct

imax=2**32

def chunky(s):
	b=0
	v=0
	for c in s:
		v<<=8
		v+=ord(c)
		if b==3:
			b=0
			yield False,v
			v=0
		b+=1
	if b:
		yield True,v

c1=0xcc9e2d51
c2=0x1b873593
r1=15
r2=13
m=5
n=0xe6546b64
h=0x8c74898c #seed

key=sys.argv[1]
for end,chunk in chunky(key):
	k=chunk
	k=(k*c1)%imax
	k=((k<<r1)|(k>>(32-r1)))%imax
	k=(k*c2)%imax
	
	h^=k
	h=((h<<r2)|(h>>(32-r2)))%imax
	h=((h*m)%imax+n)%imax
	
	if end:
		chunk=struct.unpack("I",struct.pack("<I",chunk))[0]
		chunk=(chunk*c1)%imax
		chunk=((chunk<<r1)|(chunk>>(32-r1)))%imax
		chunk=(chunk*c2)%imax
		
		h^=chunk

h^=len(key)
h^=h>>16
h=(h*0x85ebca6b)%imax
h^=h>>13
h=(h*0xc2b2ae35)%imax
h^=h>>16

print "{:08x}".format(h)
