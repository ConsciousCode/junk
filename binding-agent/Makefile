HEAD := include
SRC := src
BIN := bin
DEP := dep
OBJ := obj

CXX := clang++
CXXFLAGS := -std=c++11 -pedantic -Wall -Wextra -Werror -I$(HEAD)
LIBS := -lsfml-graphics -lsfml-system -lsfml-window -lm
NDEBUG := -DNDEBUG
DEBUG := -g -DDEBUG

MAIN := $(wildcard $(SRC)/*.cpp)
GRAPHICS := $(wildcard $(SRC)/graphics/*.cpp)
BATTLE := $(wildcard $(SRC)/battle/*.cpp)
OVERWORLD := $(wildcard $(SRC)/overworld/*.cpp)

SRCS := $(MAIN) $(GRAPHICS) $(BATTLE) $(OVERWORLD)

$(DEP)/deps.d: $(SRCS)
	$(CXX) $(CXXFLAGS) -DANY -MM $^ > $@
	sed -r -i "s,^([-a-z]+),obj/linux/\1.o obj/linux/\1-d.o obj/win/\1.o obj/win/\1-d.o,g" $@

include $(DEP)/deps.d
include *.mk

clean: OBJ := obj
clean:
	find $(OBJ) -type f -name '*.o' -delete
	find $(DEP) -type f -name '*.d' -delete

.PHONY: clean
