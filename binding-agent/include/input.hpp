#ifndef GAME_INPUT
#define GAME_INPUT

/**
 * Abstract interface for the input service.
**/
class Input{
	public:
		enum Action{
			PAUSE=0,ACT=1,ESCAPE=2,
			UP=3,DOWN=4,LEFT=5,RIGHT=6,
			MAX=7
		};
		
		virtual bool pressed(Action act) const=0;
};

#endif
