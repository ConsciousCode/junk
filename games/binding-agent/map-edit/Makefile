JAVAC := javac
JAR := jar
JFLAGS := -cp .

FBASES := MapEditor Map TileManager EditStatus

SOURCE := src
DATA := data
CLASS := class
ENTRY := MapEditor
OUTJAR := $(ENTRY).jar
PACKAGE := com.binding_agent.mapeditor
PD := $(subst .,/,$(PACKAGE))

#%.class: %.java
#	$(JAVAC) $(JFLAGS) $^

map-edit:
	$(JAVAC) $(JFLAGS) $(SOURCE)/*.java -d .
	$(JAR) cfe $(MAIN) $(OUTJAR) $(PACKAGE).$(ENTRY) $(PD)/*.class $(DATA)/*

clean:
	rm -f $(PD)/*.class
	rm -f $(OUTJAR)

.PHONY: map-edit clean
