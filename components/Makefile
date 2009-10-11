IDLC=/home/chunlei/xulrunner-sdk/bin/xpidl
INC=/home/chunlei/xulrunner-sdk/idl
XPTS=nsIFireinput.xpt

all: $(XPTS)

#	$(IDLC) -m typelib -w -v -I $(INC) -e $(@) $(<)
%.xpt: %.idl
	$(IDLC) -m typelib -w -v -I $(INC) -e $(@) $(<)

.PHONY: all

clean: 
	rm -f $(XPTS)

