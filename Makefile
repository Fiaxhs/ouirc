NW = /usr/bin/env nodewebkit
APP = /tmp/ouirc.nw

run:
	@rm -rf $(APP)
	mkdir $(APP)
	cp -r  * $(APP)
	$(NW) $(APP)
