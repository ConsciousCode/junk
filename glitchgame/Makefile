CC = g++
CF = -std=c++14 -g -DDEBUG=1
CL = -lsfml-system -lsfml-graphics -lsfml-window

game: glitchgame.cpp
	$(CC) $(CF) $^ -o $@ $(CL)

clean:
	rm game

.PHONY: clean

