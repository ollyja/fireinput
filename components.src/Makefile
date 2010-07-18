IDLC=/usr/lib/xulrunner-1.9.1/xpidl
INC=/usr/share/idl/xulrunner-sdk-1.9.1/stable
XPTS=nsIFireinput.xpt

all: $(XPTS)

#	$(IDLC) -m typelib -w -v -I $(INC) -e $(@) $(<)
%.xpt: %.idl
	$(IDLC) -m typelib -w -v -I $(INC) -e $(@) $(<)
	cp -f *.js ../components/
	cp -f *.xpt ../components/

.PHONY: all

clean: 
	rm -f $(XPTS)

