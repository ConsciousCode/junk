make := make
cc := g++
ln := ld
cf := -g -DDEBUG_LEVEL="DEBUG_ANY&~DEBUG_INPUT" -fmax-errors=1 -Wpedantic -std=c++14 -I~/.local/include
libs := -lsfml-graphics -lsfml-window -lsfml-system -lsfml-audio -lm

mess := 
objects := 

alert-depends:
	@echo Building dependency files...

depends: alert-depends

%.hpp: ;

#Guru library compilation
cwd := guru/
include uni.mk
$(obj)guru.o: $($$$(cwd)objects)
	$(ln) -r $^ -o $@
guru := $(obj)guru.o

#Evil Eye game compilation
cwd := 
include uni.mk
$(bin)evileye: $(objects)
	$(cc) $(cf) $^ -o $@ $(libs)

evileye: $(bin)evileye

all: depends
	@$(make) evileye

clean:
	rm -f $(mess) $(bin)*

.PHONY: clean evileye all alert-depends depends

