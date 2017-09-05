LINUXFLAGS := -DLINUX
LOBJ := $(OBJ)/linux

$(LOBJ)/%.o: $(SRC)/%.cpp
	$(CXX) $(CXXFLAGS) $(NDEBUG) -c $< -o $@

$(LOBJ)/%-d.o: $(SRC)/%.cpp
	$(CXX) $(CXXFLAGS) $(DEBUG) -c $< -o $@

linux: $(patsubst $(SRC)/%.cpp,$(LOBJ)/%.o,$(SRCS))
	$(CXX) $(CXXFLAGS) $(LINUXFLAGS) $(NDEBUG) $^ -o $(BIN)/game $(LIBS)

linux-debug: $(patsubst $(SRC)/%.cpp,$(LOBJ)/%-d.o,$(SRCS))
	$(CXX) $(CXXFLAGS) $(LINUXFLAGS) $(DEBUG) $^ -o $(BIN)/game-d $(LIBS)

.PHONY: linux linux-debug linux-vars
