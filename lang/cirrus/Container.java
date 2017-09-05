package com.cirrus;

/**
 * A Cirrus container.
**/
public interface Container implements Component,Iterable<Component>{
	/**
	 * @return a list of children contained by the container.
	**/
	public List<Component> getChildren();
}
