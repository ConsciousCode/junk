package com.cirrus;

import java.util.List;
import java.util.ArrayList;

/**
 * Container for exactly one component.
**/
public class Box extends Element implements Container{
	private Component child;
	
	@Override
	public List<Component> getChildren(){
		List<Component> children=new ArrayList<>(1);
		children.add(child);
		return children;
	}
	
	@Override
	public Iterator<Component> iterator(){
		return new Iterator<Component>(){
			private Component child;
			private boolean stop;
			
			public Iterator<Component> init(Component c){
				child=c;
				stop=false;
				
				return this;
			}
			
			public Component next(){
				return stop?null:child;
			}
		}.init(child);
	}
	
	@Override
	public void paint(Graphics2D g){
		int clw=child.getLogicalWidth(),clh=child.getLogicalHeight();
		BufferedImage img=new BufferedImage(clw,clh,BufferedImage.TYPE_INT_ARGB);
		child.paint(img.getGraphics());
		
		int pw=padding.left+padding.right,ph=padding.top+padding.bottom;
		if(pw!=0 || ph!=0){
			clw+=padding.left+padding.right;
			clh+=padding.top+padding.bottom;
			
			BufferedImage padded=new BufferedImage(
				clw,clh,BufferedImage.TYPE_INT_ARGB
			);
			padded.getGraphics().drawImage(img,padding.left,padding.top,null);
			img=padded;
		}
		
		int dw=getDisplayWidth(),dh=getDisplayHeight();
		if(clw>dw || clh>dh){
			overflow.paint(g,img);
		}
		else{
			g.drawImage(img,padding.left,padding.top,null);
		}
	}
}
