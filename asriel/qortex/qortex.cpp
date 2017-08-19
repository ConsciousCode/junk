#include "qortex.hpp"

#include "linalg.hpp"

#include <random>
#include <sstream>
#include <initializer_list>
#include <stdexcept>
#include <string>

namespace Q {
	typedef la::MatrixSlice MatrixSlice;
	
	/**
	 * Build a string as a stringstream.
	**/
	template<typename TOP>
	void concat_inner(std::stringstream& ss, TOP a) {
		ss << a;
	}
	template<typename TOP, typename... REST>
	void concat_inner(std::stringstream& ss, const TOP& a, REST... rest) {
		ss << a;
		concat_inner(ss, rest...);
	}
	template<typename... REST>
	std::string concat(REST... rest) {
		std::stringstream ss;
		concat_inner(ss, rest...);
		
		return ss.str();
	}
	
	void synapse(MatrixSlice W, MatrixSlice x, MatrixSlice out) {
		//Copy the bias into out
		out.copy(W.slice(0, W.rows(), W.cols() - 1, W.cols()));
		
		//Apply the main weights
		la::gemv(
			1, W.slice(0, W.rows(), 0, W.cols() - 1), x,
			1, out
		);
	}
	
	void invsynapse(MatrixSlice W, MatrixSlice x, MatrixSlice out) {
		la::gemv(
			1, W.slice(0, W.rows(), 0, W.cols() - 1).T(), x,
			0, out
		);
	}
	
	void synapse_concat(MatrixSlice W, MatrixSlice x, MatrixSlice y, MatrixSlice out) {
		//Copy the bias into out
		out.copy(W.slice(0, W.rows(), W.cols() - 1, W.cols()));
		
		//Apply the main weights
		la::gemv(
			1, W.slice(0, W.rows(), 0, x.rows()), x,
			1, out
		);
		la::gemv(
			1, W.slice(0, W.rows(), x.rows(), W.cols() - 1), y,
			1, out
		);
	}
	
	void write_string(const std::string& s, FILE* f) {
		fputc(s.length(), f);
		fwrite(s.c_str(), 1, s.length(), f);
	}
	
	std::string read_string(FILE* f) {
		char buffer[256];
		unsigned char size;
		if(fread(&size, sizeof(size), 1, f) == 0) {
			throw std::runtime_error("Unexpected EOF");
		}
		if(fread(buffer, 1, size, f) != size) {
			throw std::runtime_error("Unexpected EOF");
		}
		buffer[size] = 0;
		
		return buffer;
	}
	
	void write_int(int i, FILE* f) {
		fwrite(&i, sizeof(i), 1, f);
	}
	
	int read_int(FILE* f) {
		int i;
		if(fread(&i, sizeof(i), 1, f) == 0) {
			throw std::runtime_error("Unexpected EOF");
		}
		
		return i;
	}
	
	void write_matrix(Matrix& x, FILE* f) {
		int rows = x.rows, cols = x.cols;
		
		write_int(rows, f);
		write_int(cols, f);
		
		fwrite(x.fetch(), sizeof(float), rows*cols, f);
	}
	
	void read_matrix(Matrix& x, FILE* f) {
		int rows = read_int(f), cols = read_int(f);
		
		x.alloc(rows, cols);
		if(fread(x.fetch(), sizeof(float), rows*cols, f) != rows*cols) {
			throw std::runtime_error("Unexpected EOF");
		}
		x.push(x.fetch());
	}
	
	void write_vector(Matrix& x, FILE* f) {
		write_int(x.rows, f);
		fwrite(x.fetch(), sizeof(float), x.rows, f);
	}
	
	void read_vector(Matrix& x, FILE* f) {
		int rows = read_int(f);
		x.alloc(rows, 1);
		if(fread(x.fetch(), sizeof(float), rows, f) != rows) {
			throw std::runtime_error("Unexpected EOF");
		}
		x.push(x.fetch());
	}
	
	void write_char(char c, FILE* f) {
		fwrite(&c, sizeof(c), 1, f);
	}
	
	void read_char(char& c, FILE* f) {
		if(fread(&c, sizeof(c), 1, f) != sizeof(c)) {
			throw std::runtime_error("Unexpected EOF");
		}
	}
	
	Unit* read_unit(FILE* f) {
		char c;
		read_char(c, f);
		switch(c) {
			case '!':
				return Noise::fromFile(f);
			case 'T':
				return Transform::fromFile(f);
			case '>':
				return Sequencer::fromFile(f);
			case 'Q':
				return Cell::fromFile(f);
			case '~':
				return Simplifier::fromFile(f);
			default:
				throw std::runtime_error(concat(
					"Unknown layer identifier ", c
				));
		}
	}
	
	void Adadelta::setsize(unsigned r, unsigned c) {
		val.alloc(r, c); val.fill(0);
		g_sq.alloc(r, c); g_sq.fill(0);
		d_sq.alloc(r, c); d_sq.fill(0);
	}
	
	void Adadelta::clear() {
		g_sq.fill(0);
		d_sq.fill(0);
	}
	
	//Implementations
	
	Unit::Unit(const std::string& name):name(name) {}
	
	Unit::~Unit() {}
	
	Unit* Unit::find(const std::string& name) {
		if(this->name == name) {
			return this;
		}
		return nullptr;
	}
	
	Matrix* Unit::train(Matrix* in, Matrix* grad) {
		return grad;
	}
	
	Matrix* Unit::prepare(Matrix* in) {
		return run(in);
	}
	
	void Unit::clear() {}
	
	Cell::Cell(const std::string& name):Unit(name), built(false) {}
	
	Cell::Cell(Unit* u, const std::string& name):Unit(name) {
		add(u);
	}
	
	Cell::~Cell() {}
	
	void Cell::add(Unit* a) {
		layers.push_back(a);
	}
	
	void Cell::build(int i) {
		set_input_size(i);
	}
	
	void Cell::save(const std::string& fn) {
		FILE* f = fopen(fn.c_str(), "wb");
		save(f);
		fclose(f);
	}
	
	void Cell::save(FILE* f) {
		write_char('Q', f);
		write_string(name, f);
		write_int(layers.size(), f);
		for(Unit* u : layers) {
			u->save(f);
		}
	}
	
	Cell* Cell::fromFile(FILE* f) {
		Cell* cell = new Cell(read_string(f));
		cell->built = true;
		
		int size = read_int(f);
		for(int i = 0; i < size; ++i) {
			cell->layers.push_back(read_unit(f));
		}
		
		return cell;
	}
	
	void Cell::load(const std::string& fn) {
		FILE* f = fopen(fn.c_str(), "rb");
		load(f);
		fclose(f);
	}
	
	void Cell::load(FILE* f) {
		if(fgetc(f) != 'Q') {
			throw std::runtime_error("Not a Qortex file");
		}
		
		name = read_string(f);
		
		int size = read_int(f);
		for(int i = 0; i < size; ++i) {
			layers.push_back(read_unit(f));
		}
		
		int ft = ftell(f);
		fseek(f, 0, SEEK_END);
		if(ft != ftell(f)) {
			throw std::runtime_error("Q file has illicit trailing data.");
		}
	}
	
	Unit* Cell::find(const std::string& name) {
		for(Unit* u : layers) {
			if(Unit* f = u->find(name)) {
				return f;
			}
		}
		
		return nullptr;
	}
	
	Matrix* Cell::run(Matrix* input) {
		if(!built) {
			build(input->rows);
		}
		
		for(Unit* u : layers) {
			input = u->run(input);
		}
		
		return input;
	}
	
	Matrix* Cell::prepare(Matrix* input) {
		if(!built) {
			build(input->rows);
		}
		
		for(Unit* u : layers) {
			input = u->prepare(input);
		}
		
		outcache = input;
		
		return input;
	}
	
	Matrix* Cell::mse(Matrix* ideal) {
		//ideal = -(ideal - outcache)
		la::geam(1, outcache->slice(), -1, ideal->slice(), ideal->slice());
		
		return ideal;
	}
	
	Matrix* Cell::train(Matrix* in, Matrix* grad) {
		for(int i = layers.size() - 1; i > 0; --i) {
			grad = layers[i]->train(layers[i - 1]->get_output(), grad);
		}
		
		return layers[0]->train(in, grad);
	}
	
	Matrix* Cell::get_output() {
		return outcache;
	}
	
	int Cell::output_size() {
		return layers.back()->output_size();
	}
	
	void Cell::set_input_size(int s) {
		for(Unit* u : layers) {
			u->set_input_size(s);
			s = u->output_size();
		}
		
		built = true;
	}
	
	void Cell::clear() {
		for(Unit* u : layers) {
			u->clear();
		}
	}
	
	Noise::Noise(const std::string& name):Unit(name), active(true) {}
	
	Noise::~Noise() {}
	
	Noise* Noise::fromFile(FILE* f) {
		return new Noise(read_string(f));
	}
	
	void Noise::save(FILE* f) {
		write_char('!', f);
		write_string(name, f);
	}
	
	Matrix* Noise::run(Matrix* input) {
		if(active) {
			la::additive_noise(input->slice(), output.slice());
			
			return &output;
		}
		
		return input;
	}
			
	Matrix* Noise::get_output() {
		if(active) {
			return &output;
		}
		
		return outcache;
	}
	
	int Noise::output_size() {
		return insize;
	}
	
	void Noise::set_input_size(int s) {
		insize = s;
	}
	
	Transform::Transform(const std::string& name):Unit(name) {}
	
	Transform::Transform(int size, const std::string& name):Unit(name) {
		outsize = size;
		activation = Activation::RANGE;
	}
	
	Transform::Transform(int size, Activation a, const std::string& name):Unit(name) {
		outsize = size;
		activation = a;
	}
	
	Transform::~Transform() {}
	
	void Transform::save(FILE* f) {
		write_char('T', f);
		write_string(name, f);
		write_char((char)activation, f);
		write_matrix(Wb.val, f);
	}
	
	Transform* Transform::fromFile(FILE* f) {
		std::string name = read_string(f);
		
		char a;
		read_char(a, f);
		
		Transform* res = new Transform(name);
		read_matrix(res->Wb.val, f);
		
		res->activation = (Activation)a;
		
		return res;
	}
	
	Matrix* Transform::run(Matrix* input) {
		synapse(Wb.val.slice(), input->slice(), output.slice());
		
		switch(activation) {
			case Activation::LINEAR:
				break;
			case Activation::PROB:
				la::psquash(output.slice(), output.slice());
				break;
			case Activation::RANGE:
				la::squash(output.slice(), output.slice());
				break;
			default:
				throw std::logic_error(concat(
					"Unknown/unimplemented activation ", (int)activation
				));
		}
		
		return &output;
	}
	
	Matrix* Transform::train(Matrix* in, Matrix* grad) {
		switch(activation) {
			case LINEAR:
				break;
			case PROB:
				la::psquash_d(grad->slice(), output.slice(), grad->slice());
				break;
			case RANGE:
				la::squash_d(grad->slice(), output.slice(), grad->slice());
				break;
			default:
				throw std::logic_error(concat(
					"Unknown/unimplemented activation ", (int)activation
				));
		}
		
		//Store the gradient so it's not affected by the update.
		invsynapse(Wb.val.slice(), grad->slice(), bpgrad.slice());
		
		//dE/dWb = dE/dout * dout/dnet * dnet/dWb
		la::adadelta(
			Wb.val.slice(), grad->slice(), in->slice(),
			Wb.g_sq.slice(), Wb.d_sq.slice()
		);
		
		return &bpgrad;
	}
	
	void Transform::clear() {
		Wb.clear();
	}
	
	int Transform::output_size() {
		return outsize;
	}
	
	void Transform::set_input_size(int s) {
		Wb.setsize(outsize, s + 1);
		Wb.val.fill(0);
		
		additive_noise(Wb.val.slice(), Wb.val.slice());
	}
	
	Sequencer::Sequencer(const std::string& name):Unit(name) {}
	
	Sequencer::Sequencer(int size, const std::string& name):Unit(name) {
		outsize = size;
	}
	
	Sequencer::~Sequencer() {}
	
	void Sequencer::save(FILE* f) {
		write_char('>', f);
		write_string(name, f);
		
		write_matrix(Wf.val, f);
		write_matrix(Wu.val, f);
		
		write_vector(state, f);
	}
	
	Sequencer* Sequencer::fromFile(FILE* f) {
		Sequencer* res = new Sequencer(read_string(f));
		
		read_matrix(res->Wf.val, f);
		read_matrix(res->Wu.val, f);
		
		read_vector(res->state, f);
		
		res->outsize = res->state.rows;
		
		return res;
	}
	
	Matrix* Sequencer::run(Matrix* in) {
		synapse_concat(
			Wf.val.slice(), state.slice(), in->slice(), fout.slice()
		);
		la::psquash(fout.slice(), fout.slice());
		
		synapse_concat(
			Wu.val.slice(), state.slice(), in->slice(), uout.slice()
		);
		la::squash(uout.slice(), uout.slice());
		
		//uout = 1*uout*fout + 0*uout
		la::gemm(1, uout.slice(), fout.slice(), 0, uout.slice());
		
		//fout = 1 - fout
		la::ewlt(-1, fout.slice(), 1, fout.slice());
		//state = fout*state + uout
		la::mxpb(1, state.slice(), fout.slice(), 1, uout.slice(), state.slice());
		
		return &state;
	}
	
	Matrix* Sequencer::prepare(Matrix* in) {
		last_state.slice().copy(state.slice());
		
		return run(in);
	}
	
	Matrix* Sequencer::train(Matrix* in, Matrix* grad) {
		//Gradient of the update gate
		/*
		la::squash_d(grad->slice(), uout.slice(), uout.slice());
		invsynapse(
			Wu.val.slice(), grad->slice(),
			u_grad.slice().offset(0, outsize)
		);
		la::adadelta(
			Wu.val.slice(0, Wu.val.rows(), 0, last_state.rows),
			uout.slice(), last_state.slice(),
			Wu.g_sq.slice(0, Wu.g_sq.rows(), 0, last_state.rows),
			Wu.d_sq.slice(0, Wu.d_sq.rows(), 0, last_state.rows)
		);
		la::adadelta(
			Wu.val.slice(0, Wu.val.rows(), last_state.rows, Wu.val.cols()),
			uout.slice(), in->slice(),
			Wu.g_sq.slice(0, Wu.g_sq.rows(), last_state.rows, Wu.g_sq.cols()),
			Wu.d_sq.slice(0, Wu.d_sq.rows(), last_state.rows, Wu.g_sq.cols())
		);
		
		//Gradient of the forget gate
		la::psquash_d(grad, &fout, &fout);
		invsynapse(
			Wf.val.slice(), grad->slice(),
			f_grad.slice().offset(0, outsize)
		);
		la::adadelta(
			Wf.val.slice(), fout.slice(), in->slice(),
			Wf.g_sq.slice(), Wf.d_sq.slice()
		);
		la::adadelta_concat(&Wf.val, &fout, &state, in, &Wf.g_sq, &Wf.d_sq);
		
		//Add the gradients together for the gradient to return
		la::add(&u_grad, &f_grad, &f_grad);
		*/
		return &f_grad;
	}
	
	int Sequencer::output_size() {
		return outsize;
	}
	
	void Sequencer::set_input_size(int s) {
		int instate = s + outsize;
		
		Wf.setsize(outsize, instate + 1);
		la::additive_noise(Wf.val.slice(), Wf.val.slice());
		
		Wu.setsize(outsize, instate + 1);
		la::additive_noise(Wu.val.slice(), Wu.val.slice());
		
		state.alloc(outsize, 1);
		state.fill(0);
	}
	
	void Sequencer::clear() {
		Wf.clear();
		Wu.clear();
		state.fill(0);
	}
	
	Simplifier::Layer::Layer(Unit* u, Unit* d):up(u), down(d) {}
	
	Simplifier::Simplifier(const std::string& name):Unit(name) {}
	
	Simplifier::Simplifier(std::initializer_list<Unit*> args) {
		auto it = args.begin(), end = args.end();
		
		for(;it != end; ++it) {
			Unit* up = *it;
			++it;
			Unit* down = *it;
			layers.push_back(Layer(up, down));
		}
	}
	
	Simplifier::~Simplifier() {
		for(auto layer : layers) {
			delete layer.up;
			delete layer.down;
		}
	}
	
	Simplifier* Simplifier::fromFile(FILE* f) {
		Simplifier* res = new Simplifier(read_string(f));
		
		int size = read_int(f);
		for(int i = 0; i < size; ++i) {
			res->layers.push_back(Layer(read_unit(f), read_unit(f)));
		}
		
		return res;
	}
	
	void Simplifier::save(FILE* f) {
		write_char('~', f);
		write_string(name, f);
		
		write_int(layers.size(), f);
		for(auto layer : layers) {
			layer.up->save(f);
			layer.down->save(f);
		}
	}
	
	Matrix* Simplifier::run(Matrix* in) {
		for(int i = 0; i < layers.size(); ++i) {
			in = layers[i].up->run(in);
		}
		
		for(int i = layers.size(); i >= 0; --i) {
			in = layers[i].down->run(in);
		}
		
		return in;
	}
	
	Matrix* Simplifier::prepare(Matrix* in) {
		for(int i = 0; i < layers.size(); ++i) {
			in = layers[i].up->prepare(in);
			
			layers[i].down->prepare(in);
		}
		
		//if mode == DENOISE
		return layers[0].down->get_output();
	}
	
	Matrix* Simplifier::train(Matrix* in, Matrix* grad) {
		int i = 0;
		for(;i < layers.size() - 1; ++i) {
			Matrix* g = layers[i].down->train(layers[i].up->get_output(), grad);
			layers[i].up->train(in, g);
			
			in = layers[i].up->get_output();
			
			//We want to reconstruct the input with limited free params,
			// so make the error of the next layer the mse
			la::geam(
				1, layers[i + 1].down->get_output()->slice(),
				-1, in->slice(), layers[i + 1].grad.slice()
			);
		}
		
		Matrix* g = layers[i].down->train(layers[i].up->get_output(), grad);
		return layers[i].up->train(in, g);
	}
	
	int Simplifier::output_size() {
		return 0;
	}
	
	void Simplifier::set_input_size(int s) {
		for(auto layer : layers) {
			layer.up->set_input_size(s);
			s = layer.up->output_size();
			layer.down->set_input_size(s);
		}
	}
	
	void Simplifier::clear() {
		for(auto layer : layers) {
			layer.up->clear();
			layer.down->clear();
		}
	}
}
