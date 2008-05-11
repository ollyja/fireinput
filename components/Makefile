IDLC=/usr/lib/firefox-2.0.0.12/xpidl
INC=/usr//share/idl/firefox-2.0.0.12/
XPTS=nsIFireinput.xpt

all: $(XPTS)

%.xpt: %.idl
	$(IDLC) -m typelib -w -v -I $(INC) -e $(@) $(<)

.PHONY: all

