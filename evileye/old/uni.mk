inc = $(cwd)inc/
src = $(cwd)src/
obj = $(cwd)obj/
dep = $(cwd)dep/
bin = $(cwd)bin/

#cc = g++
#ln = ld
#cf = -g -I$(inc) -fmax-errors=1 -Wpedantic -std=c++14
#libs = -lsfml-graphics -lsfml-window -lsfml-system -lsfml-audio

#This is needed to bake local variables into recipes
define recipe =
$(1): $(2)
	$(3)
endef

include $(wildcard $(dep)*.d)

srcs := $(wildcard $(src)*.cpp)
objs := $(srcs:$(src)%.cpp=$(obj)%.o)

objects += $(objs)

#Dependency recipes
$(eval $(call recipe,$(dep)%.d,$(src)%.cpp,@$(cc) $(cf) -I$(inc) -MM $$< -MT $$(patsubst $(dep)%.d,$(obj)%.o,$$@) -MF $$@))

depends: $(objs:$(obj)%.o=$(dep)%.d)

#Object file recipes
$(eval $(call recipe,$(obj)%.o,$(src)%.cpp,$(cc) $(cf) -I$(inc) -c $$< -o $$@))

#List of stuff to look for with make clean
mess += $(obj)*.o $(dep)*.d

