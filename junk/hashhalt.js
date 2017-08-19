'use strict';
/**
 * @global
 *
 * Implementation of the Hash Key Derivation Function, as defined
 *  https://crypto.stanford.edu/~xb/security07/hkdf.pdf and renamed
 *  "halthash"
**/

if(typeof setImmediate != "function") {
    var setImmediate = function(f) {
		setTimeout(f, 0);
    };
}

class Deferred {
    constructor() {
		this.promise = new Promise((res, rej)=> {
			this.res = res;
			this.rej = rej;
		});
    }

    resolve(f) {
		return this.res(f);
    }
    
    reject(f) {
		return this.rej(f);
    }
}

function breakable(f) {
    let defer = new Deferred(), stop = false;
    
    function loop() {
		setImmediate(() => {
			if(stop) {
				defer.resolve(f(true));
				return;
			}
			
			try {
				var v = f(false);
			}
			catch(e) {
				defer.reject(e);
				return;
			}
			
			if(typeof v == 'undefined') {
				loop();
			}
			else {
				defer.resolve(v);
			}
		});
    }
	
    loop();
    
    defer.stop = function() {
		stop = true;
    }
	
    return defer;
}

function bigmod(n, m) {
    let c = 1, r = 0;
    
    for(let i = 0; i < n.length; ++i) {
		r = (((n[i]%m)*(c%m))%m + r)%m;
		c = (256*c)%m;
    }

    return r;
}

/**
 * Encode pass using the halthash method.
 *
 * @param pass The password to hash.
 * @param hpp Hash Per Pass.
**/
function encode(pass, hpp) {
    let r = crypto.randomBytes(256), z = hash(pass + salt), y = [];
    
    return breakable(done => {
		if(done) {
			return {
				v: r + serialize(H(y[0], z)),
				k: H(z, r)
			};
		}
		
		y.push(z);
		for(let i = 0; i < hpp; ++i) {
			z = H(z, y[bigmod(z, y.length)]);
		}
	});
}
