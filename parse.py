#!/usr/bin/python3

#import argparse
import re
import sys
import json

PROP = re.compile(r'''^(\s*)([^:=]+)\s*(?:[:=]\s*(.+)?)?$''')
SQ = re.compile(r'''^'([^']+|\.)'$''')
DQ = re.compile(r'''^"([^"]+|\.)"$''')
REAL = re.compile(r'''(\d+\.\d*|\d*\.\d+(?:e[-+]?\d+)?)''')
INT = re.compile(r'''(\d+)''')

#ap = argparse.ArgumentParser("A shell utility for ")

def tokenize(text):
    for line in text.split('\n'):
        if line.strip() ==  "":
            continue

        m = PROP.match(line)
        if m:
            yield m.group(1), m.group(2), m.group(3)
        else:
            raise ValueError("Invalid line {}".format(line))

def interpret(value):
    m = DQ.match(value) or SQ.match(value)
    if m:
        return m.group(1)

    m = REAL.match(value)
    if m:
        return float(m.group(1))

    m = INT.match(value)
    if m:
        return int(m.group(1))

    if value.lower() in {"yes", "true"}:
        return True

    if value.lower() in {"no", "false"}:
        return False

    return value

def assign(obj, name, value):
    nav = name.split('.')
    last = nav.pop()

    for n in nav:
        try:
            obj = obj[n]
        except:
            c = {}
            obj[n] = c
            obj = c

    obj[last] = interpret(value)

    return obj[last]

def parse(text):
    ind = ""
    root = {}
    path = [("", root)]
    cur = root

    for indent, name, value in tokenize(text):
        # Adjust path
        print name
        while not indent.startswith(ind):
            ind, cur = path.pop()
            print repr(ind)

        # Now assign
        if value is None:
            cur[name] = {}
            ind, cur = indent, cur[name]
            path.append((ind, cur))
        else:
            assign(cur, name, value)

    return root

print json.dumps(parse(''.join(line for line in sys.stdin)))
