# squiggle

[![Build Status](https://travis-ci.org/squiggle-lang/squiggle.svg)](https://travis-ci.org/squiggle-lang/squiggle-lang)
[![npm version](https://badge.fury.io/js/squiggle-lang.svg)](https://badge.fury.io/js/squiggle-lang)

## What is it?

A compile-to-JS programming language.

## How do I install it?

    npm install -g squiggle-lang

## How do I use it?

Please follow the [tutorial][].

## Which browsers/environments are supported?

Squiggle's JS output should run in any ES5 environment. It requires strict mode,
`Object.getPrototypeOf`, `Object.create`, and `Object.freeze`, which all cannot
be shimmed correctly. See [the ES5 compatibility chart][es5]. Essentially, it
means IE10+, Safari 6+, and Node v0.10+ should all be supported.

## Code of conduct

This project uses the [Contributor Covenant][coc] as its code of conduct.

## License

[MIT][]

## Contributing

- Click the "Fork" repository button and locally clone your fork
- Use a terminal and `cd` into the new directory
- Install [Node.js][nodejs]
- `npm install` (this will install the dependencies needed)
- `node src/main.js`
- Optional: `npm link` so you can just run `squiggle`

[es5]: http://kangax.github.io/compat-table/es5/
[tutorial]: http://squiggle-lang.org/tutorial/
[coc]: https://github.com/wavebeem/squiggle/blob/master/CODE_OF_CONDUCT.md
[mit]: https://github.com/wavebeem/squiggle/blob/master/LICENSE
[nodejs]: https://nodejs.org/en/
