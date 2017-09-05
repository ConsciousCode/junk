/**
 * Feature Vector using cyclical numerical representations.
**/
class FeatureVector {
	constructor(size) {
		this.feats = new Uint8Array(size);
	}
	
	/**
	 * Copy another feature vector.
	**/
	copy(fv) {
		this.feats.set(fv.feats);
	}
	
	/**
	 * Invert the feature vector into one as far away as possible.
	**/
	invert(into) {
		for(let i = 0; i < this.feats.length; ++i) {
			into[i] = this.feats[i] + 0x7f;
		}
	}
	
	/**
	 * Add another feature vector.
	**/
	add(other, into) {
		for(let i = 0; i < this.feats.length; ++i) {
			into[i] = this.feats[i] + other[i];
		}
	}
	
	/**
	 * Nudge this feature vector in the direction of the other.
	**/
	nudge(other, into, by=1) {
		for(let i = 0; i < this.feats.length; ++i) {
			if(this.feats[i] == other[i]) {
				into[i] = other[i];
			}
			
			let dif = Math.abs(this.feats[i] - other[i]);
			
			if(dif > 0x7f) {
				into[i] = this.feats[i] - by;
			}
			else {
				into[i] = this.feats[i] + by;
			}
		}
	}
}
