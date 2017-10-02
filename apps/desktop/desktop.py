#!/usr/bin/python3

import argparse
import os, os.path
import configparser
import re

parser = argparse.ArgumentParser(
	description="Interface with .desktop files"
)

parser.add_argument(
	"action", default="ls",
	help="What action to perform"
)
parser.add_argument(
	"-f", "--file", default=None,
	help="Load a file"
)
parser.add_argument(
	"args", nargs="*"
)

args = parser.parse_args()
action = args.action

system_path = "/usr/share/applications"
local_path = "/usr/local/share/applications"
user_path = os.path.expanduser("~/.local/share/applications")

ACTION = re.compile(r'''^Desktop Action (.+)$''')
class Desktop:
	def __init__(self, fn):
		self.filename = fn
		config = configparser.RawConfigParser()
		config.read(fn)
		
		self.entry = config["Desktop Entry"]
		
		actions = {}
		for sec in config.sections():
			m = ACTION.match(sec)
			if m:
				actions[m.group(1)] = config[sec]
		self.actions = actions
	
	def __getitem__(self, key):
		return self.entry[key]

def maybe_listdir(path):
	try:
		return os.listdir(path)
	except:
		return []

def list_desktop(path):
	ls = []
	for p in maybe_listdir(path):
		if os.path.splitext(p)[1] == ".desktop":
			try:
				# This is why I can't use a generator syntax
				ls.append(Desktop(os.path.join(path, p)))
			except:
				pass
	return ls

def shesc(x):
	'''SHell ESCape'''
	return "`{}`".format(x)

ls = (
	list_desktop(system_path) +
	list_desktop(local_path) +
	list_desktop(user_path)
)

entries = {}

for d in ls:
	name = d["Name"]
	ent = entries.get(name, [])
	ent.append(d)
	entries[name] = ent

if action in ['ls', 'list']:
	for k, v in entries.items():
		if len(v) > 1:
			print(k + ":", '\n\t' + '\n\t'.join(shesc(
				x["Exec"]) for x in v
			))
		else:
			print(k + ":", shesc(v[0]))
elif action in ['get']:
	ent = entries[]
