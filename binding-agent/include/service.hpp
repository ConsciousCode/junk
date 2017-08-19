#ifndef GAME_SERVICE
#define GAME_SERVICE

/**
 * Interface for providing abstract services wherever they're needed.
**/
class Service{
	private:
		//static Audio* audio_service;
		static Input* input_service;
	public:
		//static Audio& audio();
		//static void provide(Audio& au);
		
		static Input& input();
		static void provide(Input& in);
};
