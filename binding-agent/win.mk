WINFLAGS := -DWINDOWS
WOBJ := $(OBJ)/win

$(WOBJ)/%.o: $(SRC)/%.cpp
	$(CXX) $(CXXFLAGS) $(WINFLAGS) -c $< -o $@

$(WOBJ)/%-d.o: $(SRC)/%.cpp
	$(CXX) $(CXXFLAGS) $(WINFLAGS) $(DEBUG) -c $< -o $@

win: $(patsubst $(SRC)/%.cpp,$(WOBJ)/%.o,$(SRCS))
	$(CXX) $(CXXFLAGS) $^ -o $(BIN)/game $(LIBS)

win-debug: $(patsubst $(SRC)/%.cpp,$(WOBJ)/%-d.o,$(SRCS))
	$(CXX) $(CXXFLAGS) $(DEBUG) $^ -o $(BIN)/game-d $(LIBS)

.PHONY: linux linux-debug linux-vars
