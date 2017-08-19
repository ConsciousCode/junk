import json
import sys

old_data=json.load(open("old.json","r"))

print('{{"Data":"\\u0008\\u0001","Links":[')

n=0
for f in sys.stdin.read().split('\n'):
	print('{{"Name":"{}","Hash":"{}","Size":{}}},'.format(
		n,*line.split(' ')
	),end="")
	n+=1

print('{{"Name":"old","Hash":"{}","Size":{}}}]}}'.format(
	old_data['last'],old_data['size']
))
