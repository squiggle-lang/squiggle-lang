#!/usr/bin/env bash
set -e

PATH="$(npm bin):$PATH"

mocha tests --reporter dot
jshint src tests
jscs src tests
