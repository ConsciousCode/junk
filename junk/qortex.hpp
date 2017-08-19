#include <Eigen/Eigen>

namespace Q {
	using Eigen::Dynamic;
	using Eigen::RowMajor;
	
	template<typename T>
	using Matrix = Eigen::Matrix<T, Dynamic, Dynamic, RowMajor>;
	
	template<typename T>
	using Vector = Eigen::Matrix<T, Dynamic, 1>;
	
	template<typename T>
	constexpr auto activate(const T& v) {
		return v.array()/(1 + v.array().abs());
	}
	
	template<typename T>
	constexpr auto deractive(const T& v) {
		return v.array()/(1 - v.array());
	}
	
	/**
	 * Anything which can approximate an arbitrary function by an undefined
	 *  learning process.
	**/
	template<typename T>
	struct Approximation {
		virtual ~Approximation() {}
		
		virtual Vector<T> process(const Vector<T>& x) = 0;
	};
	
	/**
	 * An abstraction of some neural-network-like learning object which can
	 *  learn from a given backpropagated error signal.
	**/
	template<typename T>
	struct Walnut : public Approximation<T> {
		/**
		 * Compute the error signal to be propagated to earlier units.
		**/
		virtual Vector<T> backprop(const Vector<T>& ye) = 0;
		
		/**
		 * Change the inner weights using this error signal.
		**/
		virtual Vector<T> learn(const Vector<T>& x, const Vector<T>& ye) = 0;
	};
	
	/**
	 * A standardized, all-purpose base neural network. This forms the basic
	 *  unit of a qortex.
	**/
	template<typename T>
	struct Brain : public Walnut<T> {
		/**
		 * Dimensions of the brain.
		**/
		unsigned inp, out, mem;
		
		/**
		 * The Reset, Update, and Output gates.
		**/
		Matrix<T> R, Z, Y;
		
		/**
		 * The Reset, Update, and Output gate biases.
		**/
		Vector<T> Rb, Zb, Yb;
		
		/**
		 * The state of the brain, if applicable.
		**/
		Vector<T> state;
		
		/**
		 * Values needed for backprop calculation.
		 *
		 * reset is the reset gate output and dstate is (state - update)
		**/
		Vector<T> reset, dstate;
		
		Brain():inp{0}, out{0}, mem{0} {}
		Brain(unsigned i, unsigned o, unsigned m):inp{i}, out{o}, mem{m} {}
		
		void randomize(unsigned i, unsigned o, unsigned m) {
			inp = i; out = o; mem = m;
			
			R = Matrix<T>::Random(m + i, m);
			Rb = Vector<T>::Zero(m);
			
			Z = Matrix<T>::Random(m + i, m);
			Zb = Vector<T>::Zero(m);
			
			Y = Matrix<T>::Random(m + i, o);
			Yb = Vector<T>::Zero(o);
			
			state = Vector<T>::Zero(m);
		}
		
		virtual Vector<T> process(const Vector<T>& x) {
			//hx = concatenation of the state and input
			Vector<T> hx{state.rows() + x.rows(), 1};
			hx << state, x;
			
			//We need the output first so the state isn't corrupted
			auto out = activate((Y*hx + Yb).array());
			
			//Calculate the updated state
			auto r = activate((R*hx + Rb).array());
			auto z = activate((Z*hx + Zb).array());
			
			//Store parameters for backpropagation
			reset = r;
			dstate = (state.array() - z.array()).matrix();
			
			//Store the new state
			//m' = rm + (1 - r)z = rm + z - rz = (m - z)*r + z
			//This new form is more conducive to our needs
			//state = r.array()*state.array() + tr_1*z.array();
			state = (dstate.array()*r.array() + z.array()).matrix();
			
			return out;
		}
		
		virtual Vector<T> backprop(const Vector<T>& ye) {
			//back error = dE/do * f'(net) * W_ij
			
			return (
				Y.transpose()*(ye.array()*deractive(ye.array())).matrix()
			//We have to remove the state portion
			).block(mem, 0, inp, 1);
		}
		
		virtual Vector<T> learn(const Vector<T>& x, const Vector<T>& ye) {
			//dW_ij = -alpha * ye_i * dact/dt(net_i) * x_j
			//db_j = -alpha * ye_i * dact/dt(net_i) * 1
			
			auto dye = (ye.array()*deractive(ye.array())).matrix();
			
			Y -= dye*x;
			Yb -= dye;
			
			auto
				mxe = Y.transpose()*dye,
				me = mxe.block(0, 0, mem, 1),
				xe = mxe.block(mem, 0, inp, 1);
			
			//m' = rm + (1 - r)z
			// +  backprops equally
			// *  backprops with out*<other out>
			// 1- backprops by multiplying by -1
			
			//dZ => goes past *(1 - r) => dZ = (1 - r)*me
			Z -= ((1 - reset.array())*me.array()).matrix();
			
			//dR = me*state + -1*me*update = (state - update)*me, state is the
			// old state
			R -= (dstate.array()*me.array()).matrix();
			
			//The state doesn't factor into the backprop because we only
			// backprop one step into the past for simplicity.
			return dye;
		}
	};
}
