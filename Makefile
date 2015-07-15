all: build run

FILES = grammars/* examples/* src/* runtime/* Makefile

watch:
	ls $(FILES) | entr -rc make run

build:
	npm run travis
	[ -d build ] || mkdir build
	npm run jison -- grammars/parser.jison -o build/parser.js

run: build
	node src/main.js examples/input.txt

.PHONY: watch build run all
