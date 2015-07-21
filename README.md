# squiggle

## What is it?

A compile-to-JS programming language.

## How do I install it?

    npm install -g saikobee/squiggle

## How do I use it?

Put the following in `hello.squiggle`:

    console.log("Hello, world!")

Then run:

    squiggle hello.squiggle -o hello.js
    node hello.js

## Another programming language?

Yes.

## Why?

- It's fun
- CoffeeScript is too complicated
- Works around annoying JavaScript features

## Goals

- Easy JS interop (no marshalling data structures between languages)
- Immutability (`Object.freeze`)
- No variable rebinding (`const`)
- Function arity checking (`wrong number of arguments`)
- Exceptions on bad property access (`[][1]`, `{}.foo`, etc.)
- All files are CommonJS modules
- Expression oriented
- Objects can have computed properties
- Easy syntax
