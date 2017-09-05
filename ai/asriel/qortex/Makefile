CXX = g++
DEVCXX = nvcc
LIBS =
FLAGS = -std=c++11 -g -DDEBUG

%.o: %.cpp
	$(CXX) $(FLAGS) -c $^ -o $@

linalg.o: linalg.cpp
	$(DEVCXX) -c $^ -o $@

qortex.o: qortex.cpp
	$(CXX) $(FLAGS) -c $< -o $@

xor: test-xor.o qortex.o linalg.o
	$(CXX) $(FLAGS) $^ -o $@ $(LIBS)

sine: test-sine.o qortex.o linalg.o
	$(CXX) $(FLAGS) $^ -o $@ $(LIBS) -lsndfile

run-sine: run-sine.o qortex.o linalg.o
	$(CXX) $(FLAGS) $^ -o $@ $(LIBS) -lsndfile

noise: test-noise.o qortex.o linalg.o
	$(CXX) $(FLAGS) $^ -o $@ $(LIBS) -lsndfile

clean:
	rm ./*.o ../*.o

.PHONY: clean
