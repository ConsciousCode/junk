package com.cirrus;

public abstract class Element implements Component{
	/**
	 * The internal size object (can't be null).
	**/
	private Size size;
	
	/**
	 * The internal position object (can't be null).
	**/
	private Position pos;
	
	/**
	 * The margin around the element.
	**/
	private Borders margin;
	
	/**
	 * @return the sizing object of the element.
	**/
	public Size getSize(){
		return size;
	}
	
	/**
	 * Set the size of the element (null sets the size to Size.ZERO).
	**/
	public void setSize(Size s){
		if(s==null){
			size=Size.ZERO;
		}
		else{
			size=s;
		}
	}
	
	/**
	 * @return the position of the element.
	**/
	public Position getPosition(){
		return pos;
	}
	
	/**
	 * Set the position of the element (if null, sets to Position.ZERO).
	**/
	public void setPosition(Position p){
		if(p==null){
			pos=Position.ZERO;
		}
		else{
			pos=p;
		}
	}
	
	/**
	 * @return the margin of the element.
	**/
	public Borders getMargin(){
		return margin;
	}
	
	/**
	 * Set the margin of the element.
	**/
	//???
	
	@Override
	public int getDisplayWidth(){
		int lw=getLogicalWidth();
		
		int mw=size.getMinWidth();
		if(lw<mw){
			return mw;
		}
		
		int Mw=size.getMaxWidth();
		if(lw>Mw){
			return Mw;
		}
		
		return lw;
	}
	
	@Override
	public int getMinwidth(){
		return size.getMinWidth();
	}
	
	@Override
	public int getMaxWidth(){
		return size.getMaxWidth();
	}
	
	@Override
	public int getDisplayHeight(){
		int lh=getLogicalHeight();
		
		int mh=size.getMinHeight();
		if(lh<mh){
			return mh;
		}
		
		int Mh=size.getMaxHeight();
		if(lh>Mh){
			return Mh;
		}
		
		return lh;
	}
	
	@Override
	public int getMinHeight(){
		return size.getMinHeight();
	}
	
	@Override
	public int getMaxHeight(){
		return size.getMaxHeight();
	}
}
