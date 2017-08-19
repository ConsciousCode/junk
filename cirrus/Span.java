package com.cirrus;

import java.util.List;
import java.util.ArrayList;

/**
 * An expansive container for components laid out as text.
**/
public class Span extends Element implements Container{
	/**
	 * The inner list of children held by the container.
	**/
	private List<Component> children;
	
	public Span(Component... c){
		children=new ArrayList<>(c);
	}
	
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
