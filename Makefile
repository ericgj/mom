MAIN=index.js
SRC=$(wildcard src/*/*.js)
CONFIG=config.js package.json Makefile 
BUNDLEMAIN=index
BUNDLEXTRA=util + hooks
BUNDLETEST=src/cursor + src/util/cursor + src/util/mori

build: dst/mom.js dst/mom.sfx.js 

test: test/build/build.js

server: test
	python -m SimpleHTTPServer 8080

liveserver:
	./node_modules/live-server/live-server.js --no-browser

dst/mom.js: $(CONFIG) $(MAIN) $(SRC)
	@mkdir -p dst
	@jspm bundle $(BUNDLEMAIN) + $(BUNDLEXTRA) $@

dst/mom.sfx.js: $(CONFIG) $(MAIN) $(SRC)
	@mkdir -p dst
	@jspm bundle-sfx $(BUNDLEMAIN) + $(BUNDLEXTRA) $@

test/build/build.js: $(MAIN) $(SRC)
	@mkdir -p test/build
	@jspm bundle $(BUNDLETEST) $@

clean:
	@rm -f dst/*
	@rm -f test/build/*

.PHONY: build test server liveserver clean
