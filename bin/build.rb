#!/usr/bin/env ruby
require "json"

PATH = `npm bin`.chomp
PEG_OPTS = ["--cache", "--optimize", "size"]
PEG_IN = "grammars/parser.pegjs"
PEG_OUT = "build/parser.js"
PREDEF_IN = "runtime/predef.js"
PREDEF_OUT = "build/predef.json"

def pegjs(*args)
    system("#{PATH}/pegjs", *(PEG_OPTS + args))
end

pegjs PEG_IN, PEG_OUT

json = File.read(PREDEF_IN).to_json
File.write(PREDEF_OUT, json)
