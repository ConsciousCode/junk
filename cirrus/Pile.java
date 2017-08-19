package com.cirrus;

import java.util.List;
import java.util.ArrayList;

/**
 * A container which displays its children on top of each other.
**/
public class Pile extends Element implements Container{
	/**
	 * Inner list of children to display on top of each other.
	**/
	private List<Component> children;
	
	@Override
	public Iterator<Component> iterator(){
		return children.iterator();
	}
	
	@Override
	public List<Component> getChildren(){
		return children;
	}
	
	@Override
	public void paint(Graphics2D g){
		
		
	}
}
