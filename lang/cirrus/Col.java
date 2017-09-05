package com.cirrus;

import java.util.List;
import java.util.ArrayList;

/**
 * A column with a variable number of elements.
**/
public class Col extends Element implements Container{
	/**
	 * The elements in the column.
	**/
	private List<Component> children;
	
	public Col(Component... c){
		children=new ArrayList<>(c);
	}
	
	@Override
	public List<Component> getChildren(){
		return children;
	}
	
	@Override
	public Iterator<Component> iterator(){
		return children.iterator();
	}
	
	@Override
	public void paint(Graphics2D g){
		int off=0;
		for(Component c: children){
			Graphics2D ng=new Graphics2D();
			c.paint(ng);
			g.drawGraphics(ng,0,off);
			off+=c.getDisplayHeight();
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
		int sum=0;
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
