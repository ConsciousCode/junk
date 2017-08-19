/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * /
 * This file is part of Swarm.                                          *
 *                                                                      *
 * Foobar is free software: you can redistribute it and/or modify       *
 * it under the terms of the GNU General Public License as published by *
 * the Free Software Foundation, either version 3 of the License, or    *
 * (at your option) any later version.                                  *
 *                                                                      *
 * Foobar is distributed in the hope that it will be useful,            *
 * but WITHOUT ANY WARRANTY; without even the implied warranty of       *
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the        *
 * GNU General Public License for more details.                         *
 *                                                                      *
 * You should have received a copy of the GNU General Public License    *
 * along with Foobar.  If not, see <http://www.gnu.org/licenses/>.      *
/ * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

int main(int argv, char* argv[]) {
	unsigned w  = 640, h = 480;
	window.create(sf::VideoMode(w, h), "Swarm");
	
	while(window.isOpen()) {
		sf::Event ev;
		while(window.pollEvent(ev)) {
			switch(ev.type) {
				case sf::Event::Closed:
					window.close();
					return 0;
			}
		}
	}
}
