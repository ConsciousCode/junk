#include <cassert>

namespace Q {
	
	/**
	 * Abstract the concatenation of two arrays, used to simplify the logic
	 *  of the input-memory concatenation.
	**/
	template<typename T, typename A, typename B>
	struct _Concat {
		A&& a;
		B&& b;
		size_t alen;
		
		_Concat(A&& a, B&& b, size_t al) : a{a}, b{b}, alen{al} {}
		
		T& operator[](size_t x) {
			if(x < alen) {
				return a[x];
			}
			
			return b[x - alen];
		}
	};
	
	/**
	 * Generic indexing wrapper, used to wrap state access with _Concat.
	**/
	template<typename T, typename F>
	struct _Index {
		F f;
		
		_Index(F&& f) : f{f} {}
		
		T& operator[](size_t x) {
			return f(x);
		}
	};
	
	/**
	 * The core AI unit, capable of recurrent and non-recurrent neural
	 *  networking. This has AdaDelta learning built in. Ideally, the input,
	 *  output, and memory counts should be no more than 256, which is already
	 *  pushing it as extremely oversized. Remember, the TWO gates have
	 *  weight matrices of size (i + m, o + m), so a 256:256:256 Brain would
	 *  be (512, 512). Not only is that a really big matrix to perform linear
	 *  algebra on, the sheer parameter size makes convergence near impossible.
	 *
	 * Learning is adadelta-enabled, and derived via backpropagation through
	 *  time as follows:
	 *
	 * grad_mix/mod = 0
	 * err_bptt = [0, error]
	 *
	 * for t in now .. 0
	 *   //Backprop through multiplication gate
	 *   err_mix = err_bptt*mod_cache
	 *   err_mod = err_bptt*mix_cache
	 *
	 *   grad_mix/mod += [state(t), input(t)].*err_mix/mod
	 *   err_bptt = [W_mix(t)*err_mix + W_mod(t)*err_mod, 0]
	 *
	 * Actually implementing this loop is unnecessary, as past states can be
	 *  aggregated as finite parameters like a moving average. Errors from
	 *  past epochs don't factor and the error propagates multiplicatively,
	 *  the full average can be stored and multiplied by the current step's
	 *  error. This is equivalent to running bptt to the start of the Brain's
	 *  learning.
	**/
	template<typename T, T RHO=0.95, T EPS=1e-6>
	struct Brain {
		private:
			/**
			 * The AI has a fairly complicated data schema, so this is put in a
			 *  separate class from the learning methods to give better
			 *  encapsulation.
			**/
			struct _Data {
				/**
				 * All parameters come in pairs because there's two gates.
				**/
				struct Gates {
					/**
					 * Every parameter in data has up to 3 values in it. Rather
					 *  than doing stupidly tricky math to slice up the array,
					 *  just drop them into a structure and have the compiler
					 *  do it for us.
					 *
					 * Hemi is short for Hemisphere, seeing as there's always
					 *  two.
					**/
					struct Hemi {
						/// The value of the parameter.
						T value;
						
						/// A parameter which keeps track of 
				
						/// The square gradient, used for AdaDelta learning.
						T g_sq;
				
						/// The square delta, used for AdaDelta learning.
						T d_sq;
				
						/**
						 * Learn from the given gradient. Only used by weights.
						**/
						void update(T grad) {
							T grad_sq = RHO*g_sq + (1 - RHO)*grad*grad;
					
							T delta = grad*sqrt(d_sq + EPS)/sqrt(grad_sq + EPS);
							T delta_sq = RHO*d_sq + (1 - RHO)*delta*delta;
					
							g_sq = grad_sq;
							d_sq = delta_sq;
					
							value += delta;
						}
					};
			
					union {
						/// The mix gate
						Hemi mix;
						
						struct Memory {
							/**
							 * Alternate between these to avoid copying the
							 *  memory.
							**/
							T alt[2];
							/**
							 * The memory's echo parameter. This is an
							 *  algebraic trick taking advantage of the
							 *  brain's architecture to avoid explicit backprop
							 *  through time by keeping track of an error's
							 *  "echo" to the beginning of time. This can be
							 *  derived by noting that the gradient of the
							 *  weights involved in recurrency are only
							 *  multiplicatively related to the sum of the
							 *  previous timestep gradients.
							**/
							T echo;
						} mem;
					};
					
					union {
						/// The mod gate
						Hemi mod;
						
						/**
						 * A cache of the previous time step's gate outputs,
						 *  used for backprop calculation.
						**/
						struct Cache {
							/**
							 * The outputs of the mix and mod gates.
							 *  Last_echo keeps track of the unsummed 
							**/
							T mix, mod, last_echo;
						} cache;
					};
			
					/**
					 * Learn from the given gradient. Only used by weights.
					**/
					void update(T inp, const Gates& cache, T err) {
						mix.update(inp*cache.mod.value*err);
						mod.update(inp*cache.mix.value*err);
					}
				};
				
				/**
				 * The sizes of the brain's inputs, outputs, and memory.
				**/
				size_t i, o, m;
				
				/**
				 * All of the data is stored in one big array which is sliced
				 *  up by accessor methods.
				**/
				Gates* data;
				/**
				 * Which state vector is the "current" state, used to avoid
				 *  any actual copying by simply flipping the references.
				**/
				bool which_state;
		
				constexpr size_t rawWidth() const {
					//+2 for bias and states/caches
					return i + m + 2;
				}
		
				constexpr size_T rawHeight() const {
					return o + m;
				}
		
				constexpr size_t rawDataSize() const {
					return rawWidth()*rawHeight();
				}
		
				T& rawAt(size_t r, size_t c) {
					return data[r*rawWidth() + c];
				}
	
				_Data() {
					i = 0;
					o = 0;
					m = 0;
					data = nullptr;
					which_state = false;
				}
		
				~_Data() {
					if(data) {
						delete[] data;
					}
				}
		
				/**
				 * Set the size and allocate the data.
				**/
				void resize(size_t inp, size_t out, size_t mem) {
					i = inp;
					o = out;
					m = mem;
			
					if(data) {
						delete[] data;
					}
					data = new T[rawDataSize()];
				}
		
				/**
				 * Initialize everything to 0.
				**/
				void zero() {
					for(size_t i = 0; i < rawDataSize(); ++i) {
						data[i] = 0;
					}
				}
		
				/**
				 * Get the biases of the given output.
				**/
				Gates& bias(size_t r) {
					return rawAt(r, 0);
				}
		
				/**
				 * Get the weights of the mix and mod gates at (r, c).
				**/
				Gates& weight(size_t r, size_t c) {
					return rawAt(r + 1, c);
				}
		
				/**
				 * Get the xth state.
				**/
				T& state(size_t x) {
					return rawAt(x, i + m + 1).mem.alt[which_state];
				}
		
				/**
				 * Get the last state of the xth state parameter.
				**/
				T& last_state(size_t x) {
					return rawAt(x, i + m + 1).mem.alt[!which_state];
				}
		
				/**
				 * Move the current state to the last state.
				**/
				void toggle_state() {
					which_state = !which_state;
				}
		
				/**
				 * Get the state echo of the xth parameter.
				**/
				T& echo(size_t x) {
					return rawAt(x, i + m + 1).mem.echo;
				}
		
				/**
				 * Get the caches of the mix and mod gates' outputs at x.
				**/
				Cache& cache(size_t x) {
					return rawAt(x, i + m + 1).cache;
				}
			} data;
		
		public:
			Brain() {}
			Brain(size_t i, size_t o, size_t m) {
				data.resize(i, o, m);
			}
			
			/**
			 * Process one iteration of the brain with the given input.
			**/
			void forward(T* x, T* y) {
				//Vastly simplify the logic by abstracting concatenation
				_Index<T> state{
					[this](size_t i) {
						return this->data.state(i);
					}
				}
				_Index<T> last_state{
					[this](size_t i) {
						return this->data.last_state(i);
					}
				}
				
				_Concat<T> inp{state, x, m}, out{last_state, y, m};
				
				for(size_t r = 0; r < m + o; ++r) {
					T
						xsum = data.getBias(r).mix.value,
						msum = data.getBias(r).mod.value;
					
					for(size_t c = 0; c < m + i; ++c) {
						xsum += data.weight(r, c).mix.value*inp[c];
						msum += data.weight(r, c).mod.value*inp[c];
					}
					
					out[r] = xsum*msum;
				}
				
				//We've been writing to last_state, make it the current one
				// and the old one the last.
				data.toggle_state();
			}
			
			/**
			 * Calculate the chain rule over the brain and back propagate the
			 *  error to xe without learning from it.
			**/
			void backward(T* xe, T* ye) {
				for(unsigned c = 0; c < i; ++c) {
					T xsum = 0, msum = 0;
					
					for(unsigned r = 0; r < m + o; ++r) {
						xsum += data.weight(r, m + c).mix.value
							* data.cache(r).mod*ye[r];
						msum += data.weight(r, m + c).mod.value
							* data.cache(r).mix*ye[r];
					}
					
					xe[c] = xsum + msum;
				}
			}
			
			/**
			 * Compute the error gradient for the brain's parameters and
			 *  back propagate the error to xe.
			**/
			void learn(T* x, T* xe, T* ye) {
				_Index<T> state{
					[this](size_t i) {
						return this->data.last_state(i);
					}
				};
				
				_Concat<T> inp{state, x, m};
				
				for(unsigned c = 0; c < i; ++c) {
					T
						xsum = 0, msum = 0,
						//Echo sums to get rid of ye
						exsum = 0, emsum = 0;
					
					for(unsigned r = 0; r < m + o; ++r) {
						xsum += data.weight(r, c).mix.value
							* data.cache(r).mod*ye[r];
						exsum += data.weight(r, c).mix.value
							* data.cache(r).mod;
						
						msum += data.weight(r, c).mod.value
							* data.cache(r).mix*ye[r];
						emsum += data.weight(r, c).mod.value
							* data.cache(r).mix;
						
						//Update the weights
						//dzcol[r].update(ye[r]*out[r].echo);
						
						if(r < m) {
							//Using the inverse of the state as the error
							data.weight(r, c).update(
								inp[c], data.cache(r),
								ye[r]*data.cache(r).mem.echo
							);
						}
						else {
							//Using the provided error
							data.weight(r, c).update(
								inp[c], data.cache(r), ye[r - m]
							);
						}
					}
					
					xe[c] = xsum + msum;
				}
			}
	};
}
