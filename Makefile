all: build run

FILES  = parser.jison
FILES += parser.pegjs
FILES += predef.js
FILES += main.js
FILES += compile.js
FILES += ast.js
FILES += input.txt
FILES += Makefile

watch:
	ls $(FILES) | entr -rc make run

build:
	jison parser.jison -o build/parser.js
	# pegjs --cache parser.pegjs
	# pegjs parser.pegjs

run: build
	node main.js

.PHONY: watch build run all
