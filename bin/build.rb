#!/usr/bin/env ruby
require "json"

IN = "runtime/predef.js"
OUT = "build/predef.json"

File.read(IN)
    .to_json
    .tap {|json| File.write(OUT, json) }
