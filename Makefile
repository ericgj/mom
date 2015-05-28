
build: clean dst/mom.js dst/mom.sfx.js 

dst/mom.js:
	@mkdir -p dst
	@jspm bundle ./index $@

dst/mom.sfx.js:
	@mkdir -p dst
	@jspm bundle-sfx ./index $@

clean:
	@rm -f dst/*

.PHONY: build clean
