#!/usr/bin/env ruby

Dir["{src,tests}/**/*.js"].each do |file|
  File.write(file, `unexpand -a -t 4 #{file}`)
  File.write(file, `expand -t 2 #{file}`)
end
