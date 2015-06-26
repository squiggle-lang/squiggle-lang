all: build run

FILES  = grammars/* examples/* src/* runtime/*

watch:
	ls $(FILES) | entr -rc make run

build:
	npm run travis
	jison grammars/parser.jison -o build/parser.js
	# pegjs --cache parser.pegjs
	# pegjs parser.pegjs

run: build
	node src/main.js

.PHONY: watch build run all
