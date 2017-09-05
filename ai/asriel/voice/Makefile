CXX = g++
FLAGS = -std=c++11 -Ofast
LIBS = -lsndfile

%.o: %.cpp
	$(CXX) $(FLAGS) -c $^ -o $@

test-new: test-new.o qortex/qortex.o
	$(CXX) $(FLAGS) $^ -o $@ $(LIBS)

train: train.o qortex/qortex.o
	$(CXX) $(FLAGS) $^ -o $@ $(LIBS)

test-voice: test-voice.o qortex/qortex.o
	$(CXX) $(FLAGS) $^ -o $@ $(LIBS)

.PHONY: clean
clean:
	rm qortex/*.o *.o test-new
