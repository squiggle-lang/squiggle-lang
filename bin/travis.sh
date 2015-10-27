#!/usr/bin/env bash
set -e

PATH="$(npm bin):$PATH"

jscs src
jshint src
