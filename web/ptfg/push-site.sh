#!/bin/bash

#Convert added Qmowef9WEGjgwkwsOWojf path/to/file.jpg to hash size name
function hash+size+name {
	while read added hash name
	do
		echo $hash #$(
			#ipfs object stat $hash | sed -ne "s/CumulativeSize: //p"
		#) $name
	done
}

#Build a JSON link entry from the output of hash+size+name
function build-link {
	sed -re 's/^(.+?)\s+([0-9]+)\s+(.+)$/{"Name":"\3","Hash":"\1","Size":\2}/'
}

#Make an IPFS directory from a \n-separated list of hash size name entries
function ipfs-mkdir {
	echo '{"Data":"\u0008\u0001","Links":[' $(
		build-link | sed '2,$s/^/,/'
	) ']}' | ipfs object put
}

(
	echo $(cat files.dat | ipfs-mkdir) 'files' | hash+size+name;
	ipfs add data/index.html | hash+size+name;
	ipfs add data/metadata.js | hash+size+name;
	cat old.dat
) | ipfs-mkdir #| hash+size+name #| sed -e '1 s/$/ old/' | sponge old.dat

#cat old.dat | sed -re "s/ .+//"
