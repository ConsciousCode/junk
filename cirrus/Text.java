package com.cirrus;

/**
 * A Cirrus element which stores formatted text.
**/
public class Text extends Element{
	private String text;
	
	public Text(String s){
		setText(s);
	}
	
	public Text(){
		text="";
	}
	
	/**
	 * @return the text held by the span.
	**/
	public String getText(){
		return text;
	}
	
	/**
	 * Set the text held by the span (if null, set to "").
	**/
	public void setText(String s){
		if(s==null){
			text="";
		}
		else{
			text=s;
		}
	}
}
