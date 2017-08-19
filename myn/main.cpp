#include <iostream>

#include <irrlicht.h>

using namespace std;

using namespace irr;

using namespace core;
using namespace scene;
using namespace video;
using namespace io;
using namespace gui;

class Environment {
	private:
		IrrlichtDevice *device;
		
		IVideoDriver* driver;
		ISceneManager* smgr;
		IGUIEnvironment* guienv;
	public:
		Environment() {
			device = createDevice(
				EDT_OPENGL, dimension2d<u32>(640, 480), 16,
				false, false, false, 0
			);
			
			if(!device) {
				cerr << "Failed to create 3D renderer";
				return 1;
			}
			
			driver = device->getVideoDriver();
			smgr = device->getSceneManager();
			guienv = device->getGUIEnvironment();
		}
		
		~Environment() {
			device->drop();
		}
		
		bool run() {
			if(!device->run()) {
				return false;
			}
			
			driver->beginScene(true, true, SColor(255,100,101,140));
			smgr->drawAll();
			guienv->drawAll();
			driver->endScene();
			
			return true;
		}
};

int main(int argc, char* argv[]) {
	Environment env;
	
	if(argc == 1) {
		env.load("world.map");
	}
	else {
		env.load(argv[1]);
	}
	
	while(env.run()) {}
}
