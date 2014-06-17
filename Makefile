APP = /tmp/ouirc.nw

run:
	@rm -rf $(APP)
	mkdir $(APP)
	cp -r  * $(APP)
	`which nodewebkit` $(APP)
