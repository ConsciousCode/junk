package com.binding_agent.mapeditor;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.awt.*;
import java.util.Random;
import java.io.*;

/**
 * Class to manage tile definitions.
**/
public class TileManager{
	/**
	 * The tileset image.
	**/
	private BufferedImage tileset;
	
	/**
	 * The special empty and undefined tiles.
	**/
	private BufferedImage empty,undefined;
	
	/**
	 * The names of the tiles.
	**/
	private String[] names;
	
	/**
	 * The currently selected tile.
	**/
	private short tile;
	
	/**
	 * The size of tiles in pixels.
	**/
	public static final int TILESIZE=16;
	
	public TileManager(){
		try{
			tileset=ImageIO.read(
				this.getClass().getResourceAsStream("/data/tileset.png")
			);
		}
		catch(IOException e){
			throw new RuntimeException("Couldn't open data/tileset.png");
		}
		
		try{
			names=new BufferedReader(new InputStreamReader(
				this.getClass().getResourceAsStream("/data/tile-names.txt")
			)).readLine().split(":");
		}
		catch(IOException e){
			throw new RuntimeException("Couldn't open data/tile-names.txt");
		}
		
		empty=new BufferedImage(
			TILESIZE,TILESIZE,
			BufferedImage.TYPE_INT_RGB
		);
		Graphics2D g=(Graphics2D)empty.createGraphics();
		g.setBackground(Color.black);
		g.clearRect(0,0,TILESIZE,TILESIZE);
		
		undefined=new BufferedImage(
			TILESIZE,TILESIZE,
			BufferedImage.TYPE_INT_RGB
		);
	}
	
	/**
	 * Get the number of loaded tiles.
	**/
	public int getNumTiles(){
		return tileset.getWidth()/TILESIZE;
	}
	
	/**
	 * Get the name of the given tile.
	**/
	public String getName(short id){
		return names[id];
	}
	
	/**
	 * Update the undefined tile to have a different static pattern.
	**/
	public void updateUndefined(){
		Random r=new Random();
		Graphics2D g=(Graphics2D)undefined.createGraphics();
		g.setBackground(Color.black);
		g.clearRect(0,0,TILESIZE,TILESIZE);
		
		for(int i=0;i<2*TILESIZE;++i){
			int c=r.nextInt(256/3);//Math.max(0,(float)((r.nextGaussian()+0.25)*0.1));
			g.setColor(new Color(c,c,c));
			g.fillRect(r.nextInt(TILESIZE),r.nextInt(TILESIZE),1,1);
		}
	}
	
	/**
	 * @return A BufferedImage representing a tile with the given id.
	**/
	public BufferedImage get(short id){
		if(id<0 || id>=getNumTiles()){
			updateUndefined();
			return undefined;
		}
		
		if(id==0){
			return empty;
		}
		
		return tileset.getSubimage((id-1)*TILESIZE,0,TILESIZE,TILESIZE);
	}
	
	/**
	 * Get the currently selected tile.
	**/
	public short getCurrentTile(){
		return tile;
	}
	
	/**
	 * Set the currently selected tile.
	**/
	public void setCurrentTile(short id){
		assert(id>=0);
		tile=id;
	}
}
