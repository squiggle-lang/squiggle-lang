all: build

FILES = grammars/* src/* runtime/* Makefile

watch:
	ls $(FILES) | entr -rc make build

build:
	npm run travis
	[ -d build ] || mkdir build
	npm run jison -- grammars/parser.jison -o build/parser.js

.PHONY: watch build all
