#ifndef QORTEX_HPP
#define QORTEX_HPP

#include <vector>
#include <iostream>

#include "linalg.hpp"

namespace Q {
	typedef la::Matrix Matrix;
	
	/**
	 * Keep adadelta parameters together in one place.
	**/
	struct Adadelta {
		Matrix val;
		
		Matrix g_sq;
		Matrix d_sq;
		
		void setsize(unsigned r, unsigned c);
		
		void clear();
	};
	
	/**
	 * Base class for units in the Qortex network.
	**/
	class Unit {
		public:
			/**
			 * The unit's name, for debugging purposes.
			**/
			std::string name;
			
			Unit(const std::string& name = "");
			
			virtual ~Unit();
			
			/**
			 * Save the unit to the given file.
			**/
			virtual void save(FILE* f) = 0;
			
			/**
			 * Find a unit by its name.
			**/
			Unit* find(const std::string& name);
			
			/**
			 * Run the unit forward in time.
			**/
			virtual Matrix* run(Matrix* in) = 0;
			
			/**
			 * Run the unit forward in time, saving the local gradient for
			 *  training afterwards.
			**/
			virtual Matrix* prepare(Matrix* in);
			
			/**
			 * Compute the unit's error and apply it to its trainable
			 *  parameters.
			**/
			virtual Matrix* train(Matrix* in, Matrix* grad);
			
			/**
			 * Get a pointer to a matrix holding the unit's last output, used
			 *  for backpropagation.
			**/
			virtual Matrix* get_output() = 0;
			
			/**
			 * Get the output size of the unit.
			**/
			virtual int output_size() = 0;
			
			/**
			 * Set the input size of the unit, used for building layers in a
			 *  way which doesn't have too much repetition.
			**/
			virtual void set_input_size(int s) = 0;
			
			/**
			 * Wr any state in the network.
			**/
			virtual void clear();
	};
	
	/**
	 * A self-contained learning unit.
	**/
	class Cell : public Unit {
		private:
			std::vector<Unit*> layers;
			
			/**
			 * Cache of the last output
			**/
			Matrix* outcache;
			
			/**
			 * Whether or not the network was built, useful for low-cost
			 *  debugging.
			**/
			bool built;
		public:
			Cell(const std::string& name="");
			
			Cell(Unit* u, const std::string& name="");
			
			template<typename... ARGS>
			Cell(ARGS*... args, const std::string& name=""):Unit(name) {
				add(args...);
			}
			
			~Cell();
			
			void add(Unit* a);
			
			template<typename... REST>
			void add(Unit* u, REST... rest) {
				add(u);
				add(rest...);
			}
			
			/**
			 * Lossily calculate the Mean Square Error between the given ideal
			 *  and the last output of the network.
			**/
			Matrix* mse(Matrix* ideal);
			
			/**
			 * Finalize the network's construction by propagating intermediate
			 *  vector sizes.
			**/
			void build(int i);
			
			/**
			 * Save using the given filename.
			**/
			void save(const std::string& fn);
			
			virtual void save(FILE* f);
			
			/**
			 * Load a Qortex file from the given filename.
			**/
			void load(const std::string& fn);
			
			/**
			 * Entry point for loading a Qortex file.
			**/
			void load(FILE* f);
			
			/**
			 * Factory function for Cells.
			**/
			static Cell* fromFile(FILE* f);
			
			virtual Unit* find(const std::string& name);
			
			template<typename T>
			T* find(const std::string& name) {
				return (T*)find(name);
			}
			
			virtual Matrix* run(Matrix* input);
			
			virtual Matrix* prepare(Matrix* input);
			
			virtual Matrix* train(Matrix* in, Matrix* grad);
			
			virtual Matrix* get_output();
			
			virtual int output_size();
			
			virtual void set_input_size(int s);
			
			virtual void clear();
	};
	
	/**
	 * Inject noise into the network.
	**/
	class Noise : public Unit {
		private:
			/**
			 * Temporary used for building the model initially by passing
			 *  insize to outsize.
			**/
			int insize;
			
			/**
			 * Temporary storing the output.
			**/
			Matrix output;
			
			/**
			 * Used for when the noise is inactive.
			**/
			Matrix* outcache;
		public:
			/**
			 * Whether or not to add noise.
			**/
			bool active;
			
			Noise(const std::string& name="");
			
			~Noise();
			
			virtual void save(FILE* f);
			
			/**
			 * Factory function for Noise.
			**/
			static Noise* fromFile(FILE* f);
			
			virtual Matrix* run(Matrix* in);
			
			virtual Matrix* get_output();
			
			virtual int output_size();
			
			virtual void set_input_size(int s);
	};
	
	/**
	 * Transform perceptron layer.
	**/
	class Transform : public Unit {
		private:
			/**
			 * Inter-layer weights and bias.
			**/
			Adadelta Wb;
			
			/**
			 * Temporary used for storing outputs.
			**/
			Matrix output;
			
			/**
			 * Temporary used for storing the backpropagation gradient.
			**/
			Matrix bpgrad;
			
			/**
			 * The transform's output size.
			**/
			int outsize;
			
			/**
			 * Used in fromFile
			**/
			Transform(const std::string& name);
		public:
			/**
			 * Transforms can have a number of activation types.
			**/
			enum Activation {
				/**
				 * No squashing function, just add the activations.
				**/
				LINEAR = 0,
				/**
				 * Squash to [0, 1], usually interpreted as a probability.
				**/
				PROB = 1,
				/**
				 * Squash to [-1, 1].
				**/
				RANGE = 2
			} activation;
			
			Transform(int size, const std::string& name="");
			
			Transform(int size, Activation a, const std::string& name="");
			
			~Transform();
			
			virtual void save(FILE* f);
			
			/**
			 * Factory function for Transforms.
			**/
			static Transform* fromFile(FILE* f);
			
			virtual Matrix* run(Matrix* in);
			
			virtual Matrix* train(Matrix* in, Matrix* grad);
			
			virtual Matrix* get_output();
			
			virtual int output_size();
			
			virtual void set_input_size(int s);
			
			virtual void clear();
	};
	
	/**
	 * Unit used to model time sequences. Uses the GRU modification of the LSTM
	 *  architecture for simplicity.
	**/
	class Sequencer : public Unit {
		private:
			///Forget gate
			Adadelta Wf;
			
			///Update gate
			Adadelta Wu;
			
			/**
			 * Temporary for the output.
			**/
			Matrix output;
			
			/**
			 * Temporary for backprop.
			**/
			Matrix bpgrad, f_grad, u_grad;
			
			/**
			 * Temporary for storing the last state, used for backprop.
			**/
			Matrix last_state;
			
			/**
			 * Internal state of the sequencer.
			**/
			Matrix state;
			
			/**
			 * Temporaries.
			**/
			Matrix fout, uout;
			
			/**
			 * The size of the input, used for training (set during prepare).
			**/
			int insize;
			
			/**
			 * The size of the output, used for constructing the model.
			**/
			int outsize;
			
			/**
			 * Used in fromFile
			**/
			Sequencer(const std::string& name);
		public:
			
			Sequencer(int size, const std::string& name="");
			
			~Sequencer();
			
			virtual void save(FILE* f);
			
			/**
			 * Factory function for Probes.
			**/
			static Sequencer* fromFile(FILE* f);
			
			virtual Matrix* run(Matrix* in);
			
			virtual Matrix* prepare(Matrix* in);
			
			virtual Matrix* train(Matrix* in, Matrix* grad);
			
			virtual Matrix* get_output();
			
			virtual int output_size();
			
			virtual void set_input_size(int s);
			
			virtual void clear();
	};
	
	class Simplifier: public Unit {
		private:
			struct Layer {
				Unit* up;
				Unit* down;
				
				Matrix grad;
				
				Layer(Unit* u, Unit* d);
			};
			std::vector<Layer> layers;
			Noise n;
			
			int outsize;
			
		public:
			static Simplifier* fromFile(FILE* f);
			
			Simplifier(std::initializer_list<Unit*> args);
			Simplifier(const std::string& name);
			
			virtual ~Simplifier();
			
			virtual void save(FILE* f);
			
			Unit* find(const std::string& name);
			
			virtual Matrix* run(Matrix* in);
			
			virtual Matrix* prepare(Matrix* in);
			
			virtual Matrix* train(Matrix* in, Matrix* grad);
			
			virtual Matrix* get_output();
			
			virtual int output_size();
			
			virtual void set_input_size(int s);
			
			virtual void clear();
	};
}

#endif
