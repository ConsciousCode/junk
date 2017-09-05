package com.cirrus;

import java.util.List;
import java.util.ArrayList;

import java.awt.Graphics2D;

/**
 * A column with a variable number of elements.
**/
public class Row extends Element implements Container{
	/**
	 * The elements in the row.
	**/
	private List<Component> children;
	
	public Row(Component... c){
		children=new ArrayList<>(c);
	}
	
	public Iterator<Component> iterator(){
		return children.iterator();
	}
	
	@Override
	public List<Component> getChildren(){
		return children;
	}
	
	@Override
	public void paint(Graphics2D g){
		int off=0;
		for(Component c: children){
			Graphics2D ng=new Graphics2D();
			c.paint(ng);
			g.drawGraphics(ng,off,0);
			off+=c.getDisplayWidth();
		}
	}
	
	@Override
	public int getLogicalWidth(){
		int Mw=0;
		
		for(Component c: children){
			int dw=c.getDisplayWidth();
			if(dw>Mw){
				Mw=dw;
			}
		}
		
		return Mw;
	}
	
	@Override
	public int getMinWidth(){
		int Mmw=super.getMinWidth();
		for(Component c: children){
			int mw=c.getMinWidth();
			if(mw>Mmw){
				Mmw=mw;
			}
		}
		
		return Mmw;
	}
	
	@Override
	public int getMaxWidth(){
		int mMw=super.getMaxWidth();
		for(Component c: children){
			int Mw=c.getMaxWidth();
			if(Mw<mMw){
				mMw=Mw;
			}
		}
		
		return mMw;
	}
	
	@Override
	public int getLogicalHeight(){
		int sum=0;
		for(Component c: children){
			sum+=c.getDisplayHeight();
		}
		
		return sum;
	}
	
	@Override
	public int getMinHeight(){
		int sum=0
		for(Component c: children){
			sum+=c.getMinHeight();
		}
		
		return Math.max(sum,super.getMinHeight());
	}
	
	@Override
	public int getMaxHeight(){
		int sum=0;
		for(Component c: children){
			sum+=c.getMaxHeight();
		}
		
		return Math.min(sum,super.getMaxHeight());
	}
}
