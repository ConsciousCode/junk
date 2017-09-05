#!/bin/bash

function hash+size+name {
	while read added hash name
	do
		echo $hash $(
			ipfs object stat $hash | sed -ne "s/CumulativeSize: //p"
		) $name
	done
}

ipfs add -r data/files | head -n -1 | sed -e "s/files\/(.+)/$1/" |
	hash+size+name | tee -a files.dat
