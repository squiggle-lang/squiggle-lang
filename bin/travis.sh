#!/usr/bin/env bash
set -e

PATH="$(npm bin):$PATH"
files=(src/**/*.js)

jscs "${files[@]}"
jshint "${files[@]}"
