game.o: src/game.cpp include/game.hpp include/config.hpp \
  include/input.hpp include/overworld/overworld.hpp \
  include/overworld/map.hpp include/overworld/tile.hpp \
  include/battle/battle.hpp include/battle/combat-unit.hpp
input.o: src/input.cpp include/input.hpp
main.o: src/main.cpp include/game.hpp include/config.hpp \
  include/input.hpp include/overworld/overworld.hpp \
  include/overworld/map.hpp include/overworld/tile.hpp \
  include/battle/battle.hpp include/battle/combat-unit.hpp
menu.o: src/menu.cpp include/menu.hpp include/graphics/menu.hpp
player.o: src/player.cpp include/player.hpp \
  include/battle/combat-unit.hpp include/battle/battle.hpp
menu.o: src/graphics/menu.cpp include/graphics/menu.hpp
battle.o: src/battle/battle.cpp include/battle/battle.hpp \
  include/battle/combat-unit.hpp include/game.hpp include/config.hpp \
  include/input.hpp include/overworld/overworld.hpp \
  include/overworld/map.hpp include/overworld/tile.hpp \
  include/player.hpp include/battle/enemy.hpp
combat-unit.o: src/battle/combat-unit.cpp include/battle/combat-unit.hpp
enemy.o: src/battle/enemy.cpp include/battle/enemy.hpp \
  include/battle/combat-unit.hpp include/battle/battle.hpp
map.o: src/overworld/map.cpp include/overworld/map.hpp include/config.hpp
overworld.o: src/overworld/overworld.cpp include/overworld/overworld.hpp \
  include/overworld/map.hpp include/overworld/tile.hpp \
  include/config.hpp include/game.hpp include/input.hpp \
  include/battle/battle.hpp include/battle/combat-unit.hpp
tile.o: src/overworld/tile.cpp include/overworld/tile.hpp \
  include/config.hpp
