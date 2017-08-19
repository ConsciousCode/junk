'use strict';

function base64_to_game(b64){
	var raw=atob(b64), rl=raw.length, data=new Uint8Array(rl);
	for(var i=0;i<rl;++i){
		data[i]=raw.charCodeAt(i);
	}
	
	return data;
}

function hex(x){
	return x.toString(16).toUpperCase();
}

function V(op, reg){
	if(reg){
		return "V"+hex(op)+" (0x"+hex(reg[op])+")";
	}
	
	return "V"+hex(op);
}

function asm(op, reg, I, delay){
	switch(op&0xf000){
		case 0x0000:
			if(op==0x00e0){
				return "CLEAR SCREEN";
			}
			else if(op==0x00ee){
				return "RETURN";
			}
			
			return "RCA @"+hex(op&0x0fff);
		case 0x1000:
			return "JUMP @"+hex(op&0x0fff);
		case 0x2000:
			return "CALL @"+hex(op&0x0fff);
		case 0x3000:
			return "SKIP IF "+V((op&0x0f00)>>8, reg)+" == 0x"+hex(op&0x00ff);
		case 0x4000:
			return "SKIP IF "+V((op&0x0f00)>>8, reg)+" != 0x"+hex(op&0x00ff);
		case 0x5000:
			return "SKIP IF "+V((op&0x0f00)>>8, reg)+" == "+V(op&0x00ff);
		case 0x6000:
			return V((op&0x0f00)>>8)+" = 0x"+hex(op&0x00ff);
		case 0x7000:
			return V((op&0x0f00)>>8, reg)+" += 0x"+hex(op&0x00ff);
		case 0x8000:
			var X=(op&0x0f00)>>8, Y=(op&0x00f0)>>4;
			switch(op&0x000f){
				case 0x0000:
					return V(X)+" = "+V(Y, reg);
				case 0x0001:
					return V(X, reg)+" |= "+V(Y, reg);
				case 0x0002:
					return V(X, reg)+" &= V"+hex(Y);
				case 0x0003:
					return V(X, reg)+" ^= V"+hex(Y);
				case 0x0004:
					return V(X, reg)+" += "+hex(Y)+",  VF = overflow";
				case 0x0005:
					return V(X, reg)+" -= "+hex(Y)+",  VF = !borrow";
				case 0x0006:
					return "VF = "+V(X, reg)+" & 1,  "+V(X, reg)+" >>= 1";
				case 0x0007:
					return V(X, reg)+" = "+V(Y, reg)+" - "+V(X, reg)+
						",  VF = !borrow";
				case 0x000E:
					return "VF = "+V(X, reg)+" & 0x80,  "+V(X, reg)+" <<= 1";
			}
			break;
		case 0x9000:
			return "SKIP IF "+V((op&0x0f00)>>8, reg)+" != "+
				V((op&0x00f0, reg)>>4);
		case 0xA000:
			return "I = 0x"+hex(op&0x0fff);
		case 0xB000:
			return "JUMP V0 + "+hex(op&0x0fff);
		case 0xC000:
			return V((op&0x0f00)>>8, reg)+" = RAND & 0x"+hex(op&0x00ff);
		case 0xD000:
			return "DRAW 8 x "+(op&0x000f)+" SPRITE AT I ("+hex(I)+") TO "+
				V((op&0x0f00)>>8, reg)+",  "+V((op&0x00f0)>>4, reg);
		case 0xE000:
			if(op&0x00ff==0x009E){
				return "SKIP IF key["+V((op&0x0f00)>>8, reg)+"]";
			}
			else if(op&0x00ff==0xA1){
				return "SKIP IF !key["+V((op&0x0f00)>>8, reg)+"]";
			}
			
			break;
		case 0xF000:
			var X=(op&0x0f00)>>8;
			switch(op&0x00ff){
				case 0x0007:
					return V(X)+" = delay ("+delay+")";
				case 0x000A:
					return V(X)+" = next key (blocking)";
				case 0x0015:
					return "delay = "+V(X, reg);
				case 0x0018:
					return "sound = "+V(X, reg);
				case 0x001E:
					return "I ("+hex(I)+") += "+V(X, reg);
				case 0x0029:
					return "I = HexSprite("+V(X, reg)+")";
				case 0x0033:
					return "I[:2] ("+hex(I)+") = Decimal("+V(X, reg)+")";
				case 0x0055:
					return "DUMP V0:"+V(X, reg)+" TO I ("+hex(I)+")";
				case 0x0065:
					return "LOAD V0:"+V(X, reg)+" FROM I ("+hex(I)+")";
			}
	}
	
	return "UNDEFINED";
}

function emulate(prog, screen, beep, keys){
	var PC=512, stack=[], I, 
		reg=new Uint8ClampedArray(16), 
		mem=new Uint8ClampedArray(4096), 
		pl=prog.length, delay=0, sound=0, 
		block=false, keypresses=new Array(16);
	
	var black=new ImageData(10, 10), white=new ImageData(10, 10), 
		bd=black.data, wd=white.data;
	for(var i=0;i<10*10;++i){
		var i4=i*4;
		bd[i4]=bd[i4+1]=bd[i4+2]=0;
		wd[i4]=wd[i4+1]=wd[i4+2]=wd[i4+3]=bd[i4+3]=0xff;
	}
	
	//Load font data into memory
	var font=[
		0xf0, 0x90, 0x90, 0x90, 0xf0, //0
		0x20, 0x60, 0x20, 0x20, 0x70, //1
		0xf0, 0x10, 0xf0, 0x80, 0xf0, //2
		0xf0, 0x10, 0xf0, 0x10, 0xf0, //3
		0x90, 0x90, 0xf0, 0x10, 0x10, //4
		0xf0, 0x80, 0xf0, 0x10, 0xf0, //5
		0xf0, 0x80, 0xf0, 0x90, 0xf0, //6
		0xf0, 0x10, 0x20, 0x40, 0x40, //7
		0xf0, 0x90, 0xf0, 0x90, 0xf0, //8
		0xf0, 0x90, 0xf0, 0x10, 0xf0, //9
		0xf0, 0x90, 0xf0, 0x90, 0x90, //A
		0xe0, 0x90, 0xe0, 0x90, 0xe0, //B
		0xf0, 0x80, 0x80, 0x80, 0xf0, //C
		0xe0, 0x90, 0x90, 0x90, 0xe0, //D
		0xf0, 0x80, 0xf0, 0x80, 0xf0, //E
		0xf0, 0x80, 0xf0, 0x80, 0x80 //F
	], fl=font.length;
	
	for(var i=0;i<fl;++i){
		mem[i]=font[i];
	}
	
	//Load program into memory
	for(var i=0;i<pl;++i){
		mem[i+512]=prog[i];
	}
	
	addEventListener("keydown", function(e){
		var key=keys.indexOf(String.fromCharCode(e.which));
		if(key>=0){
			keypresses[key]=true;
			if(typeof keyblock=="number"){
				reg[block]=key;
				keyblock=false;
			}
		}
	});
	
	addEventListener("keyup", function(e){
		var key=keys.indexOf(String.fromCharCode(e.which));
		if(key>=0){
			keypresses[key]=false;
		}
	});
	
	var delay_clock=setInterval(function(){
		if(delay>0){
			--delay;
		}
		
		if(sound>0){
			if(!--sound){
				beep.pause();
			}
		}
		
		for(var y=0;y<32;++y){
			for(var x=0;x<8;++x){
				var byte=mem[4096-256+y*8+x];
				for(var b=0;b<8;++b){
					screen.putImageData(
						byte&(0x80>>b)?white:black, (x*8+b)*10, y*10
					);
				}
			}
		}
	}, 1000/60);
	
	function tick(){
		if(typeof keyblock=="number"){
			return;
		}
		
		if(PC>4096){
			throw new Error("Executed past memory boundaries");
		}
		
		var op=(mem[PC++]<<8)|mem[PC++];
		//console.log(asm(op, reg, I, delay), PC-2);
		switch(op&0xf000){
			case 0x0000:
				//00e0 clear screen
				if(op==0x00e0){
					for(var i=4096-256;i<4096;++i){
						mem[i]=0;
					}
					
					return;
				}
				//00ee return from procedure
				else if(op==0x00ee){
					PC=stack.pop();
				}
				//0NNN call RCA 1802 program at address NNN
				else{
					throw new Error(
						"Can't execute RCA at memory location "+
						(op&0x0fff).toString(16).toUpperCase()
					);
				}
				return;
			//1NNN jump to address NNN
			case 0x1000:
				PC=op&0x0fff;
				return;
			//2NNN call procedure at address NNN
			case 0x2000:
				stack.push(PC);
				PC=op&0x0fff;
				return;
			//3XNN skip next instruction if VX == NN
			case 0x3000:
				if(reg[(op&0x0f00)>>8]==(op&0x00ff)){
					PC+=2;
				}
				return;
			//4XNN skip next instruction if VX != NN
			case 0x4000:
				if(reg[(op&0x0f00)>>8]!=(op&0x00ff)){
					PC+=2;
				}
				return;
			//5XY0 skip next instruction if VX == VY
			case 0x5000:
				if(reg[(op&0x0f00)>>8]==reg[(op&0x00f0)>>4]){
					PC+=2;
				}
				return;
			//6XNN VX = NN
			case 0x6000:
				reg[(op&0x0f00)>>8]=op&0x00ff;
				return;
			//7XNN Add VX += NN
			case 0x7000:
				reg[(op&0x0f00)>>8]+=op&0x00ff;
				return;
			//8XYN depends on N
			case 0x8000:
				var VX=(op&0x0f00)>>8, VY=(op&0x00f0)>>4;
				switch(op&0x000f){
					//8XY0 VX = VY
					case 0x0000:
						reg[VX]=reg[VY];
						return;
					//8XY1 VX = VX | VY
					case 0x0001:
						reg[VX]|=reg[VY];
						return;
					//8XY2 VX = VX & VY
					case 0x0002:
						reg[VX]&=reg[VY];
						return;
					//8XY3 VX = VX ^ VY
					case 0x0003:
						reg[VX]^=reg[VY];
						return;
					//8XY4 VX = VX + VY,  VF = 1 if overflow,  0 if not
					case 0x0004:
						reg[0xF]=reg[VX]+reg[VY]>0xff;
						reg[VX]+=reg[VY];
						return;
					//8XY5 VY = VX - VY,  VF = 0 if borrow,  1 if not
					case 0x0005:
						reg[0xF]=reg[VX]-reg[VY]<0;
						reg[VX]-=reg[VY];
						return;
					//8XY6 VF = VX & 1,  VX = VX >> 1
					case 0x0006:
						reg[0xF]=reg[VX]&1;
						reg[VX]>>=1;
						return;
					//8XY7 VX = VY - VX,  VF = 0 when borrow,  1 if not
					case 0x0007:
						var dif=reg[VY]-reg[VX];
						reg[0xF]=dif<0;
						reg[VX]=dif;
						return;
					//8XYE VF = VX & 0x80,  VX = VX << 1
					case 0x000E:
						reg[0xF]=reg[VX]&0x80;
						reg[VX]<<=1;
						return;
					default:
						throw new Error(
							"Unknown instruction "+
							op.toString(16).toUpperCase()
						);
				}
				return;
			//9XY0 skip the next instruction if VX != VY
			case 0x9000:
				if(reg[(op&0x0f00)>>8]!=reg[(op&0x00f0)>>4]){
					PC+=2;
				}
				return;
			//ANNN I = NNN
			case 0xA000:
				I=op&0x0fff;
				return;
			//BNNN jump to address NNN + V0
			case 0xB000:
				PC=(op&0x0fff)+reg[0];
				return;
			//CXNN VX = rand(0, 0xff) & NN
			case 0xC000:
				reg[(op&0x0f00)>>8]=(Math.random()*0x100)&(op&0x00ff);
				return;
			//DXYN draw 8xN sprite with N bytes starting at address I at
			// (VX, VY) on screen
			case 0xD000:
				var VX=reg[(op&0x0f00)>>8], VY=reg[(op&0x00f0)>>4], N=op&0x000f;
				
				for(var y=0;y<N;++y){
					var row=mem[I+y];
					for(var x=0;x<8;++x){
						var bit=!!(row&(0x80>>x)), 
							xb=(x+VX)%64, yb=(y+VY)%32, 
							off=4096-256+yb*8+(xb/8)|0;
						
						mem[off]^=bit<<(7-xb%8);
					}
				}
				
				return;
			//EX9E/A1 skip the next instruction if key[VX]/!key[VX]
			case 0xE000:
				console.log(reg[(op&0x0f00)>>8]);
				if((op&0x00ff)==0x009E){
					if(keypresses[reg[(op&0x0f00)>>8]]){
						PC+=2;
					}
				}
				else if((op&0x00ff)==0x00A1){
					if(keypresses[reg[(op&0x0f00)>>8]]){
						PC+=2;
					}
				}
				else{
					throw new Error(
						"Unknown instruction "+op.toString(16).toUpperCase()
					);
				}
				
				return;
			//Many instructions
			case 0xF000:
				var X=(op&0x0f00)>>8;
				switch(op&0x00ff){
					//FX07 VX = delay timer
					case 0x0007:
						reg[X]=delay;
						return;
					//FX0A VX = next key id (blocking)
					case 0x000A:
						keyblock=X;
						return;
					//FX15 delay timer = VX
					case 0x0015:
						delay=reg[X];
						return;
					//FX18 sound timer = VX
					case 0x0018:
						if(reg[X]>2){
							sound=reg[X];
							beep.play();
						}
						return;
					//FX1E I = I + VX
					case 0x001E:
						I+=reg[X];
						return;
					//FX29 I = sprite for character of VX
					case 0x0029:
						I=reg[X]*5;
						return;
					//FX33 I[0/1/2] = decimal equivalent of VX
					case 0x0033:
						var val=reg[X];
						mem[I+2]=val%10;val/=10;
						mem[I+1]=val%10;val/=10;
						mem[I]=val%10;
						return;
					//Dump registers [0, X] to addresses starting at I
					case 0x0055:
						for(var i=0;i<X;++i){
							mem[I+i]=reg[i];
						}
						return;
					//Load registers [0, X] from addresses starting at I
					case 0x0065:
						for(var i=0;i<X;++i){
							reg[i]=mem[I+i];
						}
						return;
					default:
						throw new Error(
							"Unknown instruction "+
							op.toString(16).toUpperCase()
						);
				}
			default:
				throw new Error(
					"Unknown instruction "+op.toString(16).toUpperCase()
				);
		}
	}
	
	var clock=setInterval(function(){
		try{
			for(var i=0;i<16;++i){
				tick();
			}
		}
		catch(e){
			clearInterval(clock);
			clearInterval(delay_clock);
			console.log("PC at", PC);
			throw e;
		}
	}, 1/2.76);
}
