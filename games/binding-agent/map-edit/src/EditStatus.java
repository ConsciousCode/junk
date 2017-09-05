package com.binding_agent.mapeditor;

import javax.swing.*;
import java.awt.event.*;
import java.awt.*;

/**
 * Class for keeping track of editor status such as the current tile.
**/
public class EditStatus extends JPanel
implements KeyListener,MouseWheelListener{
	/**
	 * Internal tile manager reference.
	**/
	private TileManager tm;
	
	public EditStatus(TileManager t){
		tm=t;
		
		setPreferredSize(
			new Dimension(0,TileManager.TILESIZE+TileManager.TILESIZE/2)
		);
		
		addMouseWheelListener(this);
	}
	
	@Override
	public void mouseWheelMoved(MouseWheelEvent e){
		int scroll=e.getUnitsToScroll(),num=tm.getNumTiles();
		short cur=tm.getCurrentTile();
		
		if(cur<0){
			//Wrapping around through negatives too
			//(a%n + n)%n
			tm.setCurrentTile((short)(((cur+scroll)%num + num)%num));
		}
		else{
			tm.setCurrentTile((short)((cur+scroll)%num));
		}
		
		repaint();
	}
	
	@Override
	public void keyPressed(KeyEvent e){
		switch(e.getKeyCode()){
			case KeyEvent.VK_LEFT:
				if(tm.getCurrentTile()==0){
					tm.setCurrentTile((short)(tm.getNumTiles()-1));
				}
				else{
					tm.setCurrentTile((short)(tm.getCurrentTile()-1));
				}
				repaint();
				
				break;
			case KeyEvent.VK_RIGHT:
				tm.setCurrentTile(
					(short)((tm.getCurrentTile()+1)%tm.getNumTiles())
				);
				repaint();
				
				break;
			default:
				break;
		}
	}
	
	@Override
	public void keyReleased(KeyEvent e){}
	
	@Override
	public void keyTyped(KeyEvent e){}
	
	@Override
	public void paintComponent(Graphics dg){
		super.paintComponent(dg);
		
		Graphics2D g=(Graphics2D)dg;
		
		final int TILESIZE=TileManager.TILESIZE;
		short cur=tm.getCurrentTile();
		
		g.setBackground(Color.black);
		g.clearRect(0,0,getWidth(),getHeight());
		
		g.drawImage(tm.get(cur),TILESIZE/4,TILESIZE/4,null);
		
		g.setColor(Color.white);
		g.drawLine(0,0,getWidth(),0);
		g.drawString(tm.getName(cur),TILESIZE*2,getHeight()-TILESIZE/2);
	}
}
