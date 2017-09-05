package com.cirrus;

import java.awt.Graphics2D;

/**
 * An interface for implementing components in the Cirrus layout model.
**/
public interface Component{
	/**
	 * Enum representing the horizontal alignment of an element.
	**/
	public static enum HAlign{
		/**
		 * Aligns the element to the left of its container.
		**/
		LEFT,
		/**
		 * Aligns the element to the right of its container.
		**/
		RIGHT,
		/**
		 * Aligns the element in the center of its container.
		**/
		CENTER,
		/**
		 * Stretches the element as its container is resized (aligned to both
		 *  left and right).
		**/
		STRETCH
	}
	
	/**
	 * Enum representing the vertical alignment of an element.
	**/
	public static enum VAlign{
		/**
		 * Aligns the element to the top of its container.
		**/
		TOP,
		/**
		 * Aligns the element to the bottom of its container.
		**/
		BOTTOM,
		/**
		 * Aligns the element in the center of its container.
		**/
		CENTER,
		/**
		 * Stretches the element as its container is resized (aligned to both
		 *  top and bottom).
		**/
		STRETCH
	}
	
	/**
	 * @return the parent of the component, or else null.
	**/
	public Container getParent();
	
	/**
	 * Draw the component.
	 * 
	 * @param g The graphics object to paint on.
	**/
	public void paint(Graphics2D g);
	
	/**
	 * Draw the component using a textual layout.
	 * 
	 * @param width The width the component is capable of filling.
	 * @param cont An object passed to the component so it may continue
	 *  rendering after a line break. This is null if it's the first time
	 *  the method is called.
	 * 
	 * @return an object to pass to future calls to this function, or null if
	 *  it's finished rendering.
	**/
	public Object inlinePaint(Graphics2D g,int width,Object cont);
	
	/**
	 * @return the logical width of the element in pixels.
	**/
	public int getLogicalWidth();
	
	/**
	 * @return the display width of the element in pixels.
	**/
	public int getDisplayWidth();
	
	/**
	 * @return the minimum display width of the element in pixels.
	**/
	public int getMinWidth();
	
	/**
	 * @return the maximum display width of the element in pixels.
	**/
	public int getMaxWidth();
	
	/**
	 * @return the logical height of the element in pixels.
	**/
	public int getLogicalHeight();
	
	/**
	 * @return the display height of the element in pixels.
	**/
	public int getDisplayHeight();
	
	/**
	 * @return the minimum display height of the element in pixels.
	**/
	public int getMinHeight();
	
	/**
	 * @return the maximum display height of the element in pixels.
	**/
	public int getMaxHeight();
	
	/**
	 * @return the horizontal offset of the element in pixels.
	**/
	public int getHOffset();
	
	/**
	 * @return the vertical offset of the element in pixels.
	**/
	public int getVOffset();
	
	/**
	 * @return the horizontal alignment of the element (must not return null).
	**/
	public HAlign getHAlign();
	
	/**
	 * @return the vertical alignment of the element (must not return null).
	**/
	public VAlign getVAlign();
}
