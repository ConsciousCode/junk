package com.binding_agent.mapeditor;

import javax.swing.*;
import java.awt.image.BufferedImage;
import java.awt.event.*;
import java.awt.*;
import java.io.*;

/**
 * Class for handling the map representation and rendering.
**/
public class Map extends JPanel
implements MouseListener,MouseMotionListener,KeyListener,ActionListener{
	public long serialVersionUID=0L;
	
	/**
	 * Cached image of rendered map.
	**/
	private BufferedImage map;
	
	/**
	 * A timer for updates based on keyboard movement.
	**/
	private Timer update;
	/**
	 * Time in milliseconds used for smoothing movement.
	**/
	private long time;
	/**
	 * Number kept around to slow down the static.
	**/
	private int staticState;
	
	/**
	 * Reference to MapEditor, mostly for alerting to changes in modified
	 *  state.
	**/
	private MapEditor me;
	
	/**
	 * Reference to the tile manager, which keeps track of how tiles are
	 *  rendered and handled.
	**/
	private TileManager tm;
	
	/**
	 * Map's tile data.
	**/
	private short[] data;
	
	/**
	 * Map's width and height.
	**/
	private int width,height;
	
	/**
	 * The name of the map.
	**/
	private String name;
	
	/**
	 * The file to quick-save the map to.
	**/
	private File file;
	
	/**
	 * The offsets of the map widget from the upper left corner.
	**/
	private float x,y;
	
	/**
	 * The key states.
	**/
	private boolean left,up,right,down;
	
	/**
	 * Whether or not there's an unsaved modification.
	**/
	private boolean modified;
	
	/**
	 * The zoom coefficient of the map. The size of tiles is determined by
	 *  TileManager.TILESIZE*zoom.
	**/
	private float zoom;
	/**
	 * Default value for zoom. (2 is easier to work with).
	**/
	public static final float DEFAULT_ZOOM=2;
	
	/**
	 * Whether or not resizing is in progress (dragging the edges).
	**/
	private boolean resize_right,resize_down;
	
	/**
	 * The width and height of the resized map.
	**/
	private int resizeX,resizeY;
	
	/**
	 * The exit zones.
	**/
	private int[] exits;
	
	/**
	 * Background color of the non-map area.
	**/
	public static final Color BACKGROUND=new Color(0x11,0x11,0x11);
	
	/**
	 * The speed of moving the map in pixels/millisecond.
	**/
	public static final float SPEED=128.0f/1000.0f;
	
	public Map(MapEditor m,TileManager t){
		update=new Timer(1000/24,this);
		time=System.currentTimeMillis();
		update.addActionListener(this);
		
		me=m;
		tm=t;
		staticState=0;
		
		data=null;
		width=0;
		height=0;
		name="";
		file=null;
		modified=false;
		
		zoom=DEFAULT_ZOOM;
		
		render_map();
		
		update.start();
		
		addMouseListener(this);
		addMouseMotionListener(this);
	}
	
	/**
	 * Reset the whole class to a new map with the game's view size.
	**/
	public void reset(){
		width=MapEditor.VIEWW;
		height=MapEditor.VIEWH;
		data=new short[width*height];
		file=null;
		modified=false;
		
		x=0;
		y=0;
		zoom=DEFAULT_ZOOM;
		
		me.setModified(false);
		
		render_map();
		
		repaint();
	}
	
	/**
	 * Open the given map file.
	**/
	public int open(File f) throws IOException{
		DataInputStream in=new DataInputStream(
			new FileInputStream(f)
		);
		
		byte[] sig=new byte[3];
		
		in.read(sig);
		if((char)sig[0]=='M' && (char)sig[1]=='A' && (char)sig[2]=='P'){
			//Skip MAP section length
			in.skipBytes(2);
			
			int version=in.readShort();
			
			switch(version){
				case 0x0100:{
					int len=in.readByte();
					byte[] name=new byte[len];
					in.read(name);
					
					setName(new String(name,0,len,"UTF-8"));
					
					while(in.available()>0){
						int section=(in.readShort()<<8)|in.readByte();
						switch(section){
							case 0x54494C: //TIL, tiles
								in.skipBytes(2);
								width=in.readByte();
								height=in.readByte();
								data=new short[width*height];
								for(int i=0;i<data.length;++i){
									data[i]=in.readShort();
								}
								break;
							//EXT, exits
							case 0x455854:{
								in.skipBytes(2);
								int n=in.readByte();
								exits=new int[n];
								for(int i=0;i<n;++i){
									exits[i]=in.readInt();
								}
								break;
							}
							case 0x45584D: //EXM, examinations
								in.skipBytes(in.readShort());
								break;
							case 0x4D4E55: //MNU, menus
								in.skipBytes(in.readShort());
								break;
							case 0x454E54: //ENT, entities
								in.skipBytes(in.readShort());
								break;
							default:
								throw new IOException(
									"Unknown file section \""+
									(char)(section>>16)+(char)(section>>8)+
									(char)(section&0xff)+
									"\", possible corruption"
								);
						}
					}
					break;
				}
				
				default:
					throw new IOException(
						"Unsupported version "+(version>>16)+"."+
						(version>>8)+".*"
					);
			}
			
			modified=false;
			me.setModified(false);
			
			render_map();
			repaint();
			
			return version;
		}
		
		return 0;
	}
	
	/**
	 * Save the given file.
	**/
	public void save(File f) throws IOException{
		DataOutputStream out=new DataOutputStream(
			new FileOutputStream(f)
		);
		
		out.writeBytes("MAP");
		out.writeShort(3+name.length());
		out.writeShort(0x0100);//1.0.0
		out.writeByte(name.length());
		out.writeChars(name);
		
		out.writeBytes("TIL");
		out.writeShort(6+3*data.length);
		out.writeByte(width);
		out.writeByte(height);
		for(short d: data){
			out.writeShort(d);
		}
		
		//Everything else just spit out an empty section
		out.writeBytes("EXT");
		out.writeShort(2);
		out.writeByte(0);
		
		out.writeBytes("EXM");
		out.writeShort(2);
		out.writeShort(0);
		
		out.writeBytes("MNU");
		out.writeShort(2);
		out.writeShort(0);
		
		out.writeBytes("ENT");
		out.writeShort(2);
		out.writeShort(0);
		
		file=f;
		setName(f.getName());
		
		modified=false;
		me.setModified(false);
	}
	
	/**
	 * Save the map to its quick-save file.
	**/
	public void save() throws IOException{
		if(file==null){
			throw new RuntimeException("Map doesn't have a quick-save file");
		}
		
		save(file);
	}
	
	/**
	 * Whether or not something has been modified without saving.
	**/
	public boolean isModified(){
		return modified;
	}
	
	/**
	 * Whether or not there's some version of this map in the filesystem.
	**/
	public boolean isSaved(){
		return file!=null;
	}
	
	/**
	 * Zoom into the map.
	**/
	public void zoomIn(){
		zoom*=2;
		render_map();
		repaint();
	}
	
	/**
	 * Zoom out from the map.
	**/
	public void zoomOut(){
		//After 1/8, only the guidelines are visible
		if(zoom>1.0f/8.0f){
			zoom/=2;
			render_map();
			repaint();
		}
	}
	
	/**
	 * Resize the map.
	**/
	public void resizeMap(int w,int h){
		assert(w>0 && h>0);
		
		short[] d=new short[w*h];
		for(int y=0;y<Math.min(h,height);++y){
			for(int x=0;x<Math.min(w,width);++x){
				d[y*w+x]=data[y*width+x];
			}
		}
		
		width=w;
		height=h;
		data=d;
		
		modified=true;
		me.setModified(true);
		
		render_map();
		repaint();
	}
	
	/**
	 * Convert the given pixel point to map coordinates and set that tile to
	 *  the given id.
	**/
	public void setAtPoint(int mx,int my,short id){
		mx-=x;
		my-=y;
		
		mx/=TileManager.TILESIZE*zoom;
		my/=TileManager.TILESIZE*zoom;
		
		if(mx>=0 && my>=0 && mx<width && my<height){
			set(mx,my,id);
		}
	}
	
	/**
	 * Return the name of the map.
	**/
	public String getName(){
		return name;
	}
	
	/**
	 * Set the name of the map.
	**/
	public void setName(String n){
		if(name!=n){
			name=n;
			modified=true;
			me.setModified(true);
		}
	}
	
	/**
	 * Convert the given pixel point to map coordinates and set that tile to
	 *  the given id.
	**/
	public short getAtPoint(int mx,int my){
		mx-=x;
		my-=y;
		
		mx/=TileManager.TILESIZE*zoom;
		my/=TileManager.TILESIZE*zoom;
		
		if(mx>=0 && my>=0 && mx<width && my<height){
			return get(mx,my);
		}
		
		return -1;
	}
	
	/**
	 * Get the tile id at the given index.
	**/
	public short get(int x,int y){
		if(x<0 || y<0 || x>=width || y>=height){
			return -1;
		}
		
		return data[y*width+x];
	}
	
	/**
	 * Set the given index to the id.
	**/
	public void set(int x,int y,short id){
		assert(x>=0 && y>=0 && x<width && y<width);
		
		if(data[y*width+x]!=id){
			modified=true;
			me.setModified(true);
			data[y*width+x]=id;
		}
	}
	
	/**
	 * Cache a rendering of the tile map.
	**/
	public void render_map(){
		final int TILESIZE=TileManager.TILESIZE;
		
		if(width<=0 || height<=0){
			map=null;
			return;
		}
		
		map=new BufferedImage(
			(int)(width*TileManager.TILESIZE*zoom),
			(int)(height*TileManager.TILESIZE*zoom),
			BufferedImage.TYPE_INT_RGB
		);
		
		Graphics g=map.createGraphics();
		int size=(int)(TILESIZE*zoom);
		
		for(int ty=0;ty<height;++ty){
			for(int tx=0;tx<width;++tx){
				g.drawImage(tm.get(get(tx,ty)),
					//target
					tx*size,ty*size,(tx+1)*size,(ty+1)*size,
					
					//source
					0,0,TILESIZE,TILESIZE,
					
					null
				);
			}
		}
	}
	
	@Override
	public void mousePressed(MouseEvent e){
		if(e.getButton()==MouseEvent.BUTTON1){
			int east=(int)(x+zoom*TileManager.TILESIZE*width),
				south=(int)(y+zoom*TileManager.TILESIZE*height);
			
			boolean rr=east-1<=e.getX() && east+1>=e.getX(),
				rd=south-1<=e.getY() && south+1>=e.getY();
			
			if(
					east-3<=e.getX() && east+3>=e.getX() &&
					south-3<=e.getY() && south+3>=e.getY()
			){
				resize_right=true;
				resize_down=true;
				resizeX=width;
				resizeY=height;
			}
			else if(rr || rd){
				if(rr){
					resize_right=true;
					resizeX=width;
				}
				
				if(rd){
					resize_down=true;
					resizeY=height;
				}
			}
			else{
				resize_right=false;
				resize_down=false;
				
				setAtPoint(e.getX(),e.getY(),tm.getCurrentTile());
				
				render_map();
				repaint();
			}
		}
	}
	
	@Override
	public void mouseReleased(MouseEvent e){
		if(resize_right || resize_down){
			int w=resize_right?resizeX:width,h=resize_down?resizeY:height;
			resize_right=false;
			resize_down=false;
			resizeMap(w,h);
		}
	}
	
	@Override
	public void mouseClicked(MouseEvent e){}
	
	@Override
	public void mouseEntered(MouseEvent e){}
	
	@Override
	public void mouseExited(MouseEvent e){}
	
	@Override
	public void mouseMoved(MouseEvent e){
		int east=(int)(x+zoom*TileManager.TILESIZE*width),
			south=(int)(y+zoom*TileManager.TILESIZE*height);
		
		if(
				east-3<=e.getX() && east+3>=e.getX() &&
				south-3<=e.getY() && south+3>=e.getY()
		){
			setCursor(new Cursor(Cursor.SE_RESIZE_CURSOR));
		}
		else if(east-1<=e.getX() && east+1>=e.getX() && e.getY()<south-2){
			setCursor(new Cursor(Cursor.E_RESIZE_CURSOR));
		}
		else if(south-1<=e.getY() && south+1>=e.getY() && e.getX()<east-2){
			setCursor(new Cursor(Cursor.S_RESIZE_CURSOR));
		}
		else if(getCursor().getType()!=Cursor.DEFAULT_CURSOR){
			setCursor(new Cursor(Cursor.DEFAULT_CURSOR));
		}
	}
	
	@Override
	public void mouseDragged(MouseEvent e){
		if(resize_right || resize_down){
			resizeX=(int)((e.getX()-x)/TileManager.TILESIZE/zoom);
			resizeY=(int)((e.getY()-y)/TileManager.TILESIZE/zoom);
		}
		else if(getAtPoint(e.getX(),e.getY())!=tm.getCurrentTile()){
			setAtPoint(e.getX(),e.getY(),tm.getCurrentTile());
			render_map();
			
			repaint();
		}
	}
	
	@Override
	public void keyPressed(KeyEvent e){
		switch(e.getKeyCode()){
			case KeyEvent.VK_A:
				left=true;
				break;
			case KeyEvent.VK_W:
				up=true;
				break;
			case KeyEvent.VK_D:
				right=true;
				break;
			case KeyEvent.VK_S:
				down=true;
				break;
			case KeyEvent.VK_ENTER:
				x=0;
				y=0;
				repaint();
				break;
			default:
				break;
		}
		
		if((e.getModifiers() & KeyEvent.CTRL_MASK)!=0){
			left=false;
			right=false;
			up=false;
			down=false;
		}
	}
	
	@Override
	public void keyReleased(KeyEvent e){
		switch(e.getKeyCode()){
			case KeyEvent.VK_A:
				left=false;
				break;
			case KeyEvent.VK_W:
				up=false;
				break;
			case KeyEvent.VK_D:
				right=false;
				break;
			case KeyEvent.VK_S:
				down=false;
				break;
			default:
				break;
		}
	}
	
	@Override
	public void keyTyped(KeyEvent e){}
	
	@Override
	public void actionPerformed(ActionEvent e){
		long t=System.currentTimeMillis();
		x+=((left?1:0)-(right?1:0))*(t-time)*SPEED;
		y+=((up?1:0)-(down?1:0))*(t-time)*SPEED;
		
		if(staticState%5==0){
			repaint();
			staticState=0;
		}
		++staticState;
		time=t;
	}
	
	@Override
	public void paintComponent(Graphics dg){
		super.paintComponent(dg);
		
		final int TILESIZE=TileManager.TILESIZE,W=getWidth(),H=getHeight();
		
		Graphics2D g=(Graphics2D)dg;
		
		g.setBackground(BACKGROUND);
		g.clearRect(0,0,W,H);
		
		g.setColor(Color.darkGray);
		
		int lim=Math.max(getWidth(),getHeight());
		lim-=lim%TILESIZE;
		for(int i=0;i<lim;i+=TILESIZE){
			//down-left to up-right
			g.drawLine(0,i,i,0);
			g.drawLine(0,lim+i,lim+i,0);
			
			g.drawLine(0,i,getHeight()-i,getHeight());
			g.drawLine(i,0,getWidth(),getWidth()-i);
		}
		
		if(data!=null){
			int offx=(int)x,offy=(int)y;
			
			if(map!=null){
				if(resize_right || resize_down){
					int w=(int)((resize_right?resizeX:width)*TILESIZE*zoom),
						h=(int)((resize_down?resizeY:height)*TILESIZE*zoom);
					
					g.setColor(Color.black);
					g.fillRect(offx,offy,w,h);
					g.drawImage(map,
						offx,offy,
						offx+w,
						offy+h,
						0,0,w,h,
						null
					);
				}
				else{
					g.drawImage(map,offx,offy,null);
				}
			}
			
			g.setColor(Color.gray);
			for(int ty=0;ty<height;++ty){
				for(int tx=0;tx<width;++tx){
					g.drawLine(
						(int)(tx*TILESIZE*zoom)+offx,offy,
						(int)(tx*TILESIZE*zoom)+offx,
						(int)(height*TILESIZE*zoom)+offy
					);
				}
				
				g.drawLine(
					offx,(int)(ty*TILESIZE*zoom)+offy,
					(int)(width*TILESIZE*zoom)+offx,
					(int)(ty*TILESIZE*zoom)+offy
				);
			}
		}
	}
}
