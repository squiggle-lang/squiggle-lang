# squiggle

[![Build Status](https://travis-ci.org/wavebeem/squiggle.svg?branch=issues%2F35-Adds_destructuring_assignment)](https://travis-ci.org/wavebeem/squiggle)

## What is it?

A compile-to-JS programming language.

## How do I install it?

    npm install -g squiggle-lang

## How do I use it?

Please follow the [tutorial](http://squiggle-lang.org/tutorial/).

## Which browsers/environments are supported?

Squiggle's JS output should run in any ES5 environment. It requires strict mode, `Object.getPrototypeOf`, `Object.create`, and `Object.freeze`, which all cannot be shimmed correctly. See [the ES5 compatibility chart](http://kangax.github.io/compat-table/es5/). Essentially, it means IE10+, Safari 6+, and Node v0.10+ should all be supported.

## Code of conduct

This project uses the [Contributor Covenant](https://github.com/wavebeem/squiggle/blob/master/CODE_OF_CONDUCT.md) as its code of conduct.

## License

[MIT](https://github.com/wavebeem/squiggle/blob/master/LICENSE)

## Contributing

- Click the "Fork" repository button and locally clone your fork
- Use a terminal and `cd` into the new directory
- Install [Node.js](https://nodejs.org/en/)
- `npm install` (this will install the dependencies needed)
- `node src/main.js`
- Optional: `npm link` so you can just run `squiggle`
