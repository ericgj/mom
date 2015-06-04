MAIN=$(wildcard *.js)
SRC=$(wildcard src/*.js)
CONFIG=config.js package.json Makefile 
TESTDIR=test
TESTBUILDDIR=test/build
EXDIR=test
EXBUILDDIR=examples/build
BUNDLEMAIN=index
BUNDLEXTRA=util + hooks
BUNDLETEST=src/cursor + src/util/cursor + src/util/mori

build: dst/mom.js dst/mom.sfx.js 

testserver: test server

exserver: ex server

test: $(TESTBUILDDIR)/build.js

ex: $(EXBUILDDIR)/build.js

server:
	python -m SimpleHTTPServer 8080

liveserver:
	./node_modules/live-server/live-server.js --no-browser

dst/mom.js: $(CONFIG) $(MAIN) $(SRC)
	@mkdir -p dst
	@jspm bundle $(BUNDLEMAIN) + $(BUNDLEXTRA) $@

dst/mom.sfx.js: $(CONFIG) $(MAIN) $(SRC)
	@mkdir -p dst
	@jspm bundle-sfx $(BUNDLEMAIN) + $(BUNDLEXTRA) $@

$(EXBUILDDIR)/build.js: $(MAIN) $(SRC)
	@mkdir -p $(EXBUILDDIR)
	@jspm bundle $(BUNDLEMAIN) + $(BUNDLEXTRA) $@


$(TESTBUILDDIR)/build.js: $(MAIN) $(SRC)
	@mkdir -p $(TESTBUILDDIR)
	@jspm bundle $(BUNDLETEST) $@

clean:
	@rm -f dst/*
	@rm -f test/build/*
	@rm -f examples/build/*

.PHONY: build testserver exserver test ex server liveserver  clean
