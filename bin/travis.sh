#!/usr/bin/env bash
set -e

PATH="$(npm bin):$PATH"

jscs src tests
jshint src tests
mocha tests --reporter dot
