IDLC=/home/chunlei/xulrunner-sdk/bin/xpidl
INC=/home/chunlei/xulrunner-sdk/idl
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

