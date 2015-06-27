# expr-lang

The title is not final. If you have a good idea, let me know.

## What is it?

A compile-to-JS programming language.

## Another one?

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
