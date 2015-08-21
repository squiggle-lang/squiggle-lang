#!/usr/bin/env ruby
require "json"

PATH = `npm bin`.chomp
PEGJS = "#{PATH}/pegjs"
PEG_IN = "grammars/parser.pegjs"
REPL_OUT = "build/repl-parser.js"
FILE_OUT = "build/file-parser.js"
PREDEF_IN = "runtime/predef.js"
PREDEF_OUT = "build/predef.json"
PEG_OPTS = [
    "--cache",
    "--optimize", "size",
    "--allowed-start-rules",
]

def pegjs(*args)
    args = PEG_OPTS + args
    system PEGJS, *args
end

pegjs "ReplStart,Script", PEG_IN, REPL_OUT
pegjs "Module", PEG_IN, FILE_OUT

json = File.read(PREDEF_IN).to_json
File.write(PREDEF_OUT, json)
