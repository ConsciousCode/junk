import json
import sys

print(' '.join(link["Hash"] for link in json.loads(sys.stdin.read())["Links"]))
