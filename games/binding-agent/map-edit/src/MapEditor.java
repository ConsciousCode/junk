package com.binding_agent.mapeditor;

import java.awt.*;
import java.awt.event.*;
import javax.swing.*;
import java.io.*;

/**
 * Base class for the map editor program
**/
public class MapEditor extends JFrame implements ActionListener,WindowListener{
	public long serialVersionUID=0L;
	
	/**
	 * The editor's tile manager.
	**/
	private TileManager tm;
	
	/**
	 * Internal map representation and renderer.
	**/
	private Map map;
	
	/**
	 * Component to display the editor's status.
	**/
	private EditStatus status;
	
	/**
	 * Major version number (changes when the whole program changes beyond
	 *  recognition).
	**/
	public static final int MAJOR=0;
	
	/**
	 * Minor version number (changes when there are large changes to features,
	 *  resets to 0 on MAJOR changes).
	**/
	public static final int MINOR=4;
	
	/**
	 * Revision version number (increments with any unique stable version,
	 *  resets to 0 on MINOR changes).
	**/
	public static final int REVISION=0;
	
	/**
	 * The size of the game's viewport.
	**/
	public static final int VIEWW=15,VIEWH=15;
	
	/**
	 * Version string.
	**/
	public final String version=MAJOR+"."+MINOR+"."+REVISION;
	
	public MapEditor(){
		setModified(false);
		
		addWindowListener(this);
		setDefaultCloseOperation(WindowConstants.DO_NOTHING_ON_CLOSE);
		
		tm=new TileManager();
		
		map=new Map(this,tm);
		addKeyListener(map);
		
		status=new EditStatus(tm);
		addKeyListener(status);
		
		createMenuBar();
		
		Container pane=getContentPane();
		pane.setLayout(new GridBagLayout());
		
		GridBagConstraints gbc=new GridBagConstraints();
		gbc.gridx=0;
		gbc.weightx=1;
		
		gbc.fill=GridBagConstraints.BOTH;
		gbc.anchor=GridBagConstraints.PAGE_START;
		gbc.gridy=0;
		gbc.weighty=1;
		map.setOpaque(true);
		map.setBackground(Color.red);
		pane.add(map,gbc);
		
		gbc.fill=GridBagConstraints.HORIZONTAL;
		gbc.anchor=GridBagConstraints.PAGE_END;
		gbc.gridy=1;
		gbc.weighty=0;
		pane.add(status,gbc);
		
		pack();
		
		setSize(
			(int)((VIEWW+3)*TileManager.TILESIZE*Map.DEFAULT_ZOOM),
			(int)((VIEWH+3)*TileManager.TILESIZE*Map.DEFAULT_ZOOM)
		);
		
		setVisible(true);
	}
	
	/**
	 * Create the menu bar
	**/
	public void createMenuBar(){
		JMenuBar menubar=new JMenuBar();
		
		JMenu file=new JMenu("File");
		file.setMnemonic('F');
		
		JMenuItem item;
		
		item=new JMenuItem("Open");
		item.setToolTipText("Open a map file for editing");
		item.setActionCommand("open");
		item.addActionListener(this);
		item.setMnemonic('O');
		item.setAccelerator(
			KeyStroke.getKeyStroke(KeyEvent.VK_O,InputEvent.CTRL_DOWN_MASK)
		);
		file.add(item);
		
		item=new JMenuItem("New");
		item.setToolTipText("Create a new map");
		item.setActionCommand("new");
		item.addActionListener(this);
		item.setMnemonic('N');
		item.setAccelerator(
			KeyStroke.getKeyStroke(KeyEvent.VK_N,InputEvent.CTRL_DOWN_MASK)
		);
		file.add(item);
		
		item=new JMenuItem("Save");
		item.setToolTipText("Save this map");
		item.setActionCommand("save");
		item.addActionListener(this);
		item.setMnemonic('S');
		item.setAccelerator(
			KeyStroke.getKeyStroke(KeyEvent.VK_S,InputEvent.CTRL_DOWN_MASK)
		);
		file.add(item);
		
		item=new JMenuItem("Save As");
		item.setToolTipText("Save this map with a new name");
		item.setActionCommand("save-as");
		item.addActionListener(this);
		item.setMnemonic('A');
		file.add(item);
		
		menubar.add(file);
		
		JMenu edit=new JMenu("Edit");
		edit.setMnemonic('E');
		
		item=new JMenuItem("Change name");
		item.setToolTipText("Change the name of the map");
		item.setActionCommand("change-name");
		item.addActionListener(this);
		item.setMnemonic('C');
		item.setAccelerator(
			KeyStroke.getKeyStroke(KeyEvent.VK_N,InputEvent.CTRL_DOWN_MASK)
		);
		edit.add(item);
		
		item=new JMenuItem("Zoom in");
		item.setToolTipText("Increase the visible size of the map");
		item.setActionCommand("zoom-in");
		item.addActionListener(this);
		item.setMnemonic('I');
		item.setAccelerator(KeyStroke.getKeyStroke('='));
		edit.add(item);
		
		item=new JMenuItem("Zoom out");
		item.setToolTipText("Decrease the visible size of the map");
		item.setActionCommand("zoom-out");
		item.addActionListener(this);
		item.setMnemonic('O');
		item.setAccelerator(KeyStroke.getKeyStroke('-'));
		edit.add(item);
		
		menubar.add(edit);
		
		setJMenuBar(menubar);
	}
	
	/**
	 * Something will cause lost data, ask the user if they want to save and
	 *  then act on their response. Return false if the action should be
	 *  canceled, true if it can continue.
	**/
	public boolean askForSave(){
		if(map.isModified()){
			int res=JOptionPane.showConfirmDialog(this,
				"There are unsaved changes to your map."+
				" Would you like to save?"
			);
			if(res==JOptionPane.YES_OPTION){
				saveAction();
				
				return true;
			}
			else if(res==JOptionPane.NO_OPTION){
				return true;
			}
			else{
				return false;
			}
		}
		
		return true;
	}
	
	/**
	 * Open action.
	**/
	public void openAction(){
		if(askForSave()){
			JFileChooser fd=new JFileChooser();
			if(fd.showOpenDialog(this)==JFileChooser.APPROVE_OPTION){
				try{
					map.open(fd.getSelectedFile());
				}
				catch(IOException e){
					/*
					JOptionPane.showMessageDialog(
						this,"Couldn't open file: "+e.getMessage()
					);
					*/
					e.printStackTrace();
					System.exit(0);
					throw new RuntimeException(e.getMessage());
				}
			}
		}
	}
	
	/**
	 * New file action.
	**/
	public void newAction(){
		if(askForSave()){
			map.reset();
		}
	}
	
	/**
	 * Save action.
	**/
	public void saveAction(){
		try{
			if(map.isSaved()){
				map.save();
			}
			else{
				saveAsAction();
			}
		}
		catch(IOException e){
			JOptionPane.showMessageDialog(this,"Couldn't open file: "+e);
		}
	}
	
	/**
	 * Save as action.
	**/
	public void saveAsAction(){
		try{
			JFileChooser fd=new JFileChooser();
			if(fd.showSaveDialog(this)==JFileChooser.APPROVE_OPTION){
				File f=fd.getSelectedFile();
				map.save(f);
			}
		}
		catch(IOException e){
			JOptionPane.showMessageDialog(this,"Couldn't open file: "+e);
		}
	}
	
	/**
	 * Close action.
	**/
	public void closeAction(){
		if(askForSave()){
			System.exit(0);
		}
	}
	
	/**
	 * Communication with the map as to whether or not the map is modified.
	**/
	public void setModified(boolean modified){
		if(modified){
			setTitle("Binding Agent Map Editor v"+version+" *");
		}
		else{
			setTitle("Binding Agent Map Editor v"+version);
		}
	}
	
	@Override
	public void actionPerformed(ActionEvent e){
		switch(e.getActionCommand()){
			case "open":
				openAction();
				break;
			
			case "new":
				newAction();
				break;
			
			case "close":
				closeAction();
				break;
				
			case "save":
				saveAction();
				break;
				
			case "save-as":
				saveAsAction();
				break;
			
			case "change-name":
				map.setName(JOptionPane.showInputDialog(
					this,"Map's name:",map.getName()
				));
				break;
			
			case "zoom-in":
				map.zoomIn();
				break;
			
			case "zoom-out":
				map.zoomOut();
				break;
			
			default:
				break;
		}
	}
	
	@Override
	public void windowActivated(WindowEvent e){}

	@Override
	public void windowClosed(WindowEvent e){}

	@Override
	public void windowClosing(WindowEvent e){
		closeAction();
	}

	@Override
	public void windowDeactivated(WindowEvent e){}

	@Override
	public void windowDeiconified(WindowEvent e){}

	@Override
	public void windowIconified(WindowEvent e){}

	@Override
	public void windowOpened(WindowEvent e){}
	
	public static void main(String[] args){
		EventQueue.invokeLater(new Runnable() {
			@Override
			public void run(){
				//Try to set the look and feel to the system's native feel
				try{
					UIManager.setLookAndFeel(
						UIManager.getSystemLookAndFeelClassName()
					);
				}
				//The look and feel isn't important, just ignore any errors
				catch(UnsupportedLookAndFeelException e){
					System.out.println("Failed to set L&F");
				}
				catch(InstantiationException e){}
				catch(IllegalAccessException e){}
				catch(ClassNotFoundException e){}
				
				new MapEditor();
			}
		});
	}
}
