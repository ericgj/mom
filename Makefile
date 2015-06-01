MAIN=index.js
SRC=$(wildcard src/*/*.js)

build: dst/mom.js dst/mom.sfx.js 

test: test/build/cursor.js

server: test
	python -m SimpleHTTPServer 8080

liveserver:
	./node_modules/live-server/live-server.js --no-browser

dst/mom.js: $(MAIN) $(SRC)
	@mkdir -p dst
	@jspm bundle ./index $@

dst/mom.sfx.js: $(MAIN) $(SRC)
	@mkdir -p dst
	@jspm bundle-sfx ./index $@

test/build/cursor.js: src/cursor.js src/util/cursor.js src/util/mori.js
	@mkdir -p test/build
	@jspm bundle src/cursor + src/util/cursor + src/util/mori $@

clean:
	@rm -f dst/*
	@rm -f test/build/*

.PHONY: build test server liveserver clean
